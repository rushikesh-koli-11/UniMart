import os
import traceback
import gc
from threading import Thread

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_compress import Compress
from flask_cors import CORS
import google.generativeai as genai

# ====================================================
# GLOBALS
# ====================================================
rag = None

# ====================================================
# LOAD ENV
# ====================================================
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY missing")

genai.configure(api_key=GEMINI_API_KEY)

# ====================================================
# FLASK APP
# ====================================================
app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=False,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "OPTIONS"],
)

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

Rules:
1. Only answer UniMart grocery-related queries.
2. Max 120 words.
3. English only.
4. No greetings.
5. Identity reply:
   "I am UniMart Assistant. I help you shop groceries and assist with your orders."
"""

# ====================================================
# RAG INITIALIZATION
# ====================================================
def ensure_rag_ready():
    global rag
    try:
        from rag_utils import RAGStore
        rag = RAGStore()

        if os.path.exists("vector_index.faiss") and os.path.exists("vector_meta.pkl"):
            rag.load_index()
        else:
            rag.ingest_folder("knowledge")

        print("✅ RAG READY")

    except Exception as e:
        print("⚠️ RAG failed, Gemini-only mode:", e)
        rag = None

# ====================================================
# HELPERS
# ====================================================
def build_prompt(user_message: str, context: str) -> str:
    ctx = f"\n--- CONTEXT ---\n{context}\n--- END ---\n" if context else ""
    return f"{MASTER_PROMPT}\n{ctx}\nUser: {user_message}\nReply clearly."

def generate_with_gemini(prompt: str) -> str:
    try:
        res = gemini_model.generate_content(
            prompt,
            generation_config={
                "max_output_tokens": 400,
                "temperature": 0.3,
            },
            request_options={"timeout": 300},
        )
        return res.text.strip()
    except Exception as e:
        print("⚠️ Gemini warming up:", repr(e))
        return "The assistant is starting up. Please try again in a moment."

# ====================================================
# HEALTH
# ====================================================
@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "rag_ready": rag is not None
    }), 200

# ====================================================
# CHAT
# ====================================================
@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return "", 200

    try:
        data = request.get_json(force=True)
        message = data.get("message", "").strip()

        if not message:
            return jsonify({"response": "Please enter a message."}), 200

        context = ""
        if rag:
            try:
                context, _ = rag.retrieve_text_for_prompt(message, top_k=4)
            except Exception:
                context = ""

        prompt = build_prompt(message, context)
        reply = generate_with_gemini(prompt)

        gc.collect()
        return jsonify({"response": reply, "sources": []}), 200

    except Exception as e:
        print("❌ Fatal /chat error:", e)
        traceback.print_exc()
        return jsonify({
            "response": "The assistant is starting up. Please try again."
        }), 200

# ====================================================
# ROOT
# ====================================================
@app.route("/")
def home():
    return "UniMart Assistant is running."

# ====================================================
# START
# ====================================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    Thread(target=ensure_rag_ready, daemon=True).start()
    app.run(host="0.0.0.0", port=port, debug=False)
