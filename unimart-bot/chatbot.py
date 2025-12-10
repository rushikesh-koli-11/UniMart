import os
import traceback
import gc
from threading import Thread

from dotenv import load_dotenv  # type: ignore
from flask import Flask, request, jsonify  # type: ignore
from flask_compress import Compress  # type: ignore
from flask_cors import CORS  # type: ignore
import google.generativeai as genai  # type: ignore

# ====================================================
# GLOBALS
# ====================================================
rag = None  # Lazy-loaded RAG

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

# ✅ EXPLICIT, STABLE CORS (IMPORTANT)
CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=False,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "OPTIONS"],
)

# ✅ FORCE CORS HEADERS ON EVERY RESPONSE
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

Compress(app)

# ====================================================
# GEMINI MODEL
# ====================================================
MODEL_NAME = "gemini-2.5-flash-lite"
gemini_model = genai.GenerativeModel(model_name=MODEL_NAME)

# ====================================================
# SYSTEM PROMPT
# ====================================================
MASTER_PROMPT = """
You are UniMart Assistant — the official AI assistant for UniMart Grocery E-Commerce Platform.

Purpose:
- Help customers with grocery selection, product recommendations, offers, orders, delivery, and support.

Rules:
1. Only answer UniMart grocery-related queries.
2. Keep answers under 120 words.
3. English only.
4. No greetings.
5. Identity reply:
   "I am UniMart Assistant. I help you shop groceries and assist with your orders."
6. Use only provided context.
"""

# ====================================================
# RAG INITIALIZATION (LAZY + SAFE)
# ====================================================
def ensure_rag_ready():
    global rag
    print("🔁 RAG init starting…")

    try:
        from rag_utils import RAGStore  # heavy import delayed
        rag = RAGStore()

        idx = os.path.exists("vector_index.faiss")
        meta = os.path.exists("vector_meta.pkl")
        print(f"🔎 Index exists={idx}, meta exists={meta}")

        if not idx or not meta:
            print("⚙️ Building RAG index from knowledge/")
            rag.ingest_folder("knowledge")
            print("✅ RAG index created")
        else:
            rag.load_index()
            print("✅ RAG index loaded")

    except Exception as e:
        print("❌ RAG init failed:", e)
        traceback.print_exc()
        rag = None

# ====================================================
# HELPERS
# ====================================================
def build_prompt(user_message: str, context_text: str) -> str:
    ctx = f"\n--- CONTEXT ---\n{context_text}\n--- END ---\n" if context_text else ""
    return f"{MASTER_PROMPT}\n{ctx}\nUser: {user_message}\nReply clearly under 100 words."

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
# HEALTH CHECK
# ====================================================
@app.route("/health")
def health():
    return "OK", 200

# ====================================================
# RAG STATUS (DEBUG)
# ====================================================
@app.route("/rag-status")
def rag_status():
    return jsonify({
        "rag_loaded": rag is not None,
        "index_exists": os.path.exists("vector_index.faiss"),
        "meta_exists": os.path.exists("vector_meta.pkl"),
    })

# ====================================================
# CHAT API
# ====================================================
@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    global rag

    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json(force=True)
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"response": "Please enter a message."}), 400

    # ✅ If RAG not ready → Gemini-only fallback (NO BLOCKING)
    if rag is None:
        prompt = build_prompt(user_message, "")
        reply = generate_with_gemini(prompt)
        return jsonify({"response": reply, "sources": []})

    try:
        retrieved_text, items = rag.retrieve_text_for_prompt(user_message, top_k=4)
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
# ROOT
# ====================================================
@app.route("/")
def home():
    return "UniMart Assistant is running."

# ====================================================
# START SERVER (RENDER SAFE)
# ====================================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    print(f"🚀 UniMart Assistant starting on port {port}")

    Thread(target=ensure_rag_ready, daemon=True).start()
    app.run(host="0.0.0.0", port=port, debug=False)
