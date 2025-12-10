import os
import glob
import pickle
import gc
from pathlib import Path
from typing import List, Dict, Tuple, Optional

import numpy as np # type: ignore
from tqdm import tqdm
from sentence_transformers import SentenceTransformer # type: ignore
import faiss  # type: ignore
import fitz  # type: ignore # PyMuPDF
import torch # type: ignore

# CONFIGURATION
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
VECTOR_INDEX_PATH = "vector_index.faiss"
METADATA_PATH = "vector_meta.pkl"
EMBEDDINGS_CACHE = "embeddings.npy"
CHUNK_INFO_PATH = "chunk_info.pkl"
CHUNK_SIZE = 300                # smaller chunk = fewer tokens
CHUNK_OVERLAP = 50
BATCH_SIZE = 16
USE_CPU = not torch.cuda.is_available()
IVF_THRESHOLD = 5000
IVF_NLIST = 256
NORMALIZE_EMBEDDINGS = True
MAX_CONTEXT_CHARS = 1200        # truncate context for Gemini

# RAGStore
class RAGStore:
    def __init__(self, model_name: str = EMBEDDING_MODEL_NAME):
        self.device = "cuda" if (not USE_CPU and torch.cuda.is_available()) else "cpu"
        print(f"🧠 Loading embedding model '{model_name}' on {self.device.upper()}")
        self._model_name = model_name
        self.model: Optional[SentenceTransformer] = None
        self.index: Optional[faiss.Index] = None
        self.metadatas: List[Dict] = []
        self.embeddings: Optional[np.ndarray] = None

    # ---------------------------
    # Model utils
    # ---------------------------
    def _ensure_model(self):
        if self.model is None:
            self.model = SentenceTransformer(self._model_name, device=self.device)
            os.environ["TOKENIZERS_PARALLELISM"] = "false"

    # ---------------------------
    # File readers
    # ---------------------------
    def _read_txt(self, path: str) -> str:
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                return "\n".join(line.strip() for line in f if line.strip())
        except Exception as e:
            print(f"⚠️ Error reading TXT {path}: {e}")
            return ""

    def _read_pdf(self, path: str) -> str:
        text_parts = []
        try:
            with fitz.open(path) as doc:
                for page in doc:
                    t = page.get_text("text")
                    if t and t.strip():
                        text_parts.append(t.strip())
        except Exception as e:
            print(f"⚠️ Error reading PDF {path}: {e}")
        return "\n".join(text_parts)

    def _load_file_text(self, path: str) -> str:
        ext = Path(path).suffix.lower()
        if ext == ".pdf":
            return self._read_pdf(path)
        elif ext in (".txt", ".md", ".csv"):
            return self._read_txt(path)
        else:
            print(f"⚠️ Skipping unsupported file type: {path}")
            return ""

    # ---------------------------
    # Chunking
    # ---------------------------
    def _chunk_text(self, text: str) -> List[str]:
        text = text.replace("\r", " ").strip()
        if not text:
            return []
        sentences = []
        for part in text.split("\n"):
            for sent in part.split(". "):
                sent = sent.strip()
                if sent:
                    sentences.append(sent + ("" if sent.endswith(".") else "."))

        chunks, cur = [], ""
        for sent in sentences:
            if len(cur) + len(sent) <= CHUNK_SIZE:
                cur = (cur + " " + sent).strip()
            else:
                if cur:
                    chunks.append(cur)
                overlap = cur[-CHUNK_OVERLAP:] if CHUNK_OVERLAP and cur else ""
                cur = (overlap + " " + sent).strip()
        if cur:
            chunks.append(cur)

        final_chunks = []
        for c in chunks:
            if len(c) <= CHUNK_SIZE:
                final_chunks.append(c)
            else:
                for i in range(0, len(c), CHUNK_SIZE - CHUNK_OVERLAP):
                    piece = c[i:i + CHUNK_SIZE].strip()
                    if piece:
                        final_chunks.append(piece)
        return final_chunks

    # ---------------------------
    # Ingest folder -> FAISS index
    # ---------------------------
    def ingest_folder(self, folder: str = "knowledge", rebuild: bool = True):
        if not os.path.exists(folder):
            raise FileNotFoundError(f"❌ Folder not found: {folder}")

        print(f"📂 Scanning folder: {folder}")
        patterns = ["*.txt", "*.pdf", "*.md"]
        paths = []
        for p in patterns:
            paths.extend(glob.glob(os.path.join(folder, p)))
        paths = sorted(paths)
        if not paths:
            raise ValueError(f"❌ No valid files found in {folder}")

        all_chunks, metadatas = [], []
        for path in tqdm(paths, desc="📄 Processing files"):
            raw = self._load_file_text(path)
            if not raw:
                continue
            chunks = self._chunk_text(raw)
            for i, c in enumerate(chunks):
                all_chunks.append(c)
                metadatas.append({
                    "source": os.path.basename(path),
                    "chunk_index": i,
                    "text_snippet": c[:400]
                })

        if not all_chunks:
            raise RuntimeError("❌ No text to ingest after processing files.")

        print(f"🔢 Total chunks: {len(all_chunks)}")

        self._ensure_model()
        embeddings_list = []
        total = len(all_chunks)
        for i in tqdm(range(0, total, BATCH_SIZE), desc="🚀 Embedding chunks"):
            batch = all_chunks[i:i + BATCH_SIZE]
            emb = self.model.encode(batch, convert_to_numpy=True, show_progress_bar=False) # type: ignore
            embeddings_list.append(emb.astype(np.float32))

        embeddings = np.vstack(embeddings_list).astype(np.float32)
        if NORMALIZE_EMBEDDINGS:
            faiss.normalize_L2(embeddings)

        np.save(EMBEDDINGS_CACHE, embeddings)
        with open(METADATA_PATH, "wb") as f:
            pickle.dump(metadatas, f)
        with open(CHUNK_INFO_PATH, "wb") as f:
            pickle.dump({"num_chunks": len(all_chunks)}, f)

        dim = embeddings.shape[1]
        if embeddings.shape[0] >= IVF_THRESHOLD:
            nlist = min(IVF_NLIST, max(64, embeddings.shape[0] // 16))
            quantizer = faiss.IndexFlatIP(dim) if NORMALIZE_EMBEDDINGS else faiss.IndexFlatL2(dim)
            index = faiss.IndexIVFFlat(quantizer, dim, nlist,
                                       faiss.METRIC_INNER_PRODUCT if NORMALIZE_EMBEDDINGS else faiss.METRIC_L2)
            print(f"🧭 Training IVF index: nlist={nlist}")
            index.train(embeddings)
            index.add(embeddings)
            index.nprobe = max(4, nlist // 10)
        else:
            index = faiss.IndexFlatIP(dim) if NORMALIZE_EMBEDDINGS else faiss.IndexFlatL2(dim)
            index.add(embeddings)

        faiss.write_index(index, VECTOR_INDEX_PATH)

        self.index = index
        self.metadatas = metadatas
        self.embeddings = embeddings

        del embeddings_list, embeddings, all_chunks
        gc.collect()

        print(f"✅ Ingestion done — indexed {len(self.metadatas)} chunks.")

    # ---------------------------
    # Load index
    # ---------------------------
    def load_index(self):
        if not os.path.exists(VECTOR_INDEX_PATH) or not os.path.exists(METADATA_PATH):
            raise FileNotFoundError("Index or metadata missing. Run ingest_folder() first.")
        print("📥 Loading FAISS index and metadata...")
        self.index = faiss.read_index(VECTOR_INDEX_PATH)
        with open(METADATA_PATH, "rb") as f:
            self.metadatas = pickle.load(f)
        try:
            self.embeddings = np.load(EMBEDDINGS_CACHE, mmap_mode="r")
        except Exception:
            self.embeddings = None
        print(f"✅ Loaded index with {len(self.metadatas)} chunks.")

    # ---------------------------
    # Retrieval
    # ---------------------------
    def retrieve(self, query: str, top_k: int = 2) -> List[Dict]:
        if not query.strip():
            return []
        if self.index is None:
            self.load_index()

        self._ensure_model()
        q_emb = self.model.encode([query], convert_to_numpy=True).astype(np.float32) # type: ignore
        if NORMALIZE_EMBEDDINGS:
            faiss.normalize_L2(q_emb)

        k = max(1, min(top_k, 10))
        scores, idxs = self.index.search(q_emb, k) # type: ignore

        results = []
        for score, idx in zip(scores[0], idxs[0]):
            if 0 <= idx < len(self.metadatas):
                m = self.metadatas[int(idx)].copy()
                m["score"] = float(score)
                results.append(m)
        return results


    # ---------------------------
    # Minimal token + source-free context builder
    # ---------------------------
    def retrieve_text_for_prompt(self, query: str, top_k: int = 2) -> Tuple[str, List[Dict]]:
        items = self.retrieve(query, top_k=top_k)
        if not items:
            return "", []

        # Build context using only text snippets (no sources, no scores)
        context = "\n".join(
            it["text_snippet"].strip()
            for it in items
            if it.get("text_snippet")
        )

        # Trim context length to stay under token limits
        context = context[:MAX_CONTEXT_CHARS]

        # Return only the clean context for LLM, metadata stays internal
        return context, []


# ---------------------------
# Prompt Builder for Gemini
# ---------------------------
def build_prompt(query: str, context: str) -> str:
    """
    Lightweight, token-efficient prompt template for Gemini.
    """
    return f"""Use the following context to answer accurately and concisely.

Context:
{context}

Question: {query}
Answer:"""
