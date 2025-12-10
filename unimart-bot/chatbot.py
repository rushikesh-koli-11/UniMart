import os
import traceback
import gc
from threading import Thread

from dotenv import load_dotenv  # type: ignore
from flask import Flask, request, jsonify, render_template  # type: ignore
from flask_compress import Compress  # type: ignore
from flask_cors import CORS  # type: ignore
import google.generativeai as genai  # type: ignore

# ====================================================
# GLOBALS (IMPORTANT)
# ====================================================
rag = None  # ✅ Lazy-loaded later

# ====================================================
# LOAD ENV
# ====================================================
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("❌ GEMINI_API_KEY missing")

genai.configure(api_key=GEMINI_API_KEY)

# ====================================================
# FLASK APP
# ====================================================
app = Flask(__name__)
CORS(app)
Compress(app)

# ====================================================
# GEMINI MODEL (LIGHTWEIGHT)
# ====================================================
MODEL_NAME = "gemini-2.5-flash-lite"
gemini_model = genai.GenerativeModel(model_name=MODEL_NAME)

# ====================================================
# SYSTEM PROMPT
# ====================================================
MASTER_PROMPT = """
You are UniMart Assistant — the official AI assistant for UniMart Grocery E-Commerce Platform.

Purpose:
- Help with grocery products, offers, bundles, delivery, orders, payments, and support.
- Categories: Fruits, Vegetables, Dairy, Bakery, Snacks, Staples, Beverages, Household, Personal care.

Rules:
1. Only answer UniMart grocery-related queries.
2. Keep answers under 120 words.
3. English only.
4. No greetings.
5. Identity reply:
   "I am UniMart Assistant. I help you shop groceries and assist with your orders."
6. Use only provided context. Do not hallucinate.
"""

# ====================================================
# RAG INITIALIZATION (LAZY)
# ====================================================
def ensure_rag_ready():
    global rag
    try:
        from rag_utils import RAGStore  # ✅ heavy import delayed
        rag = RAGStore()

        if not os.path.exists("vector_index.faiss") or not os.path.exists("vector_meta.pkl"):
            print("⚙️ Building RAG index...")
            rag.ingest_folder("knowledge")
            print("✅ RAG index created.")
        else:
            rag.load_index()
            print("✅ RAG index loaded.")
    except Exception as e:
        print("❌ RAG init failed:", e)
        traceback.print_exc()


# ====================================================
# PROMPT BUILDER
# ====================================================
def build_prompt(user_message: str, context_text: str) -> str:
    ctx = ""
    if context_text:
        ctx = f"""
--- PRODUCT INFO ---
{context_text}
--- END ---
"""

    return f"""
{MASTER_PROMPT}
{ctx}
Customer message: {user_message}
Respond clearly in under 100 words.
"""


# ====================================================
# GEMINI CALL
# ====================================================
def generate_with_gemini(prompt: str) -> str:
    try:
        res = gemini_model.generate_content(
            prompt,
            generation_config={"max_output_tokens": 400, "temperature": 0.3},
            request_options={"timeout": 15},
        )
        return getattr(res, "text", "").strip() or "Unable to generate a response."
    except Exception as e:
        print("⚠️ Gemini error:", e)
        return "Assistant is temporarily unavailable."


# ====================================================
# HEALTH CHECK (RENDER REQUIRES THIS)
# ====================================================
@app.route("/health")
def health():
    return "OK", 200


# ====================================================
# CHAT API
# ====================================================
@app.route("/chat", methods=["POST"])
def chat():
    global rag

    if rag is None:
        return jsonify({
            "response": "UniMart Assistant is warming up. Please try again shortly."
        }), 503

    try:
        data = request.get_json(force=True)
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({"response": "Please enter a message."}), 400

        retrieved_text, items = "", []
        try:
            retrieved_text, items = rag.retrieve_text_for_prompt(user_message, top_k=4)
        except Exception as e:
            print("⚠️ RAG retrieval error:", e)

        prompt = build_prompt(user_message, retrieved_text)
        reply = generate_with_gemini(prompt)

        sources = [
            {
                "source": it.get("source"),
                "score": float(it.get("score", 0)),
                "snippet": it.get("text_snippet", "")
            }
            for it in items
        ]

        gc.collect()
        return jsonify({"response": reply, "sources": sources})

    except Exception as e:
        print("❌ /chat error:", e)
        traceback.print_exc()
        return jsonify({"response": "Internal server error."}), 500


# ====================================================
# OPTIONAL HOME (FOR TESTING)
# ====================================================
@app.route("/")
def home():
    return "UniMart Assistant is running."


# ====================================================
# START SERVER (RENDER SAFE)
# ====================================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    print(f"🚀 UniMart Assistant binding on port {port}")

    # ✅ Start RAG in background AFTER port binding
    Thread(target=ensure_rag_ready, daemon=True).start()

    app.run(host="0.0.0.0", port=port, debug=False)
