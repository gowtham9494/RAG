"""Document loader and chunker for the RAG pipeline.

Reads Markdown files from the data directory, splits them into
overlapping chunks, and stores embeddings in ChromaDB.
"""

import os
import glob
from pathlib import Path

from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

from config import settings


# Paths — resolved relative to project root (one level up from backend/)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data"
GITHUB_DIR = PROJECT_ROOT / ".github"


def _get_embeddings() -> OpenAIEmbeddings:
    """Return the configured OpenAI embedding model."""
    return OpenAIEmbeddings(
        model=settings.embedding_model,
        openai_api_key=settings.openai_api_key,
    )


def _get_vector_store() -> Chroma:
    """Return the ChromaDB vector store instance."""
    return Chroma(
        collection_name="rock_insurance",
        embedding_function=_get_embeddings(),
        persist_directory=settings.chroma_persist_dir,
    )


def load_documents() -> list:
    """Load all Markdown files from data/ and .github/ directories.

    Returns:
        List of LangChain Document objects.
    """
    documents = []

    # Load from data/ directory
    if DATA_DIR.exists():
        for md_file in DATA_DIR.glob("**/*.md"):
            try:
                loader = TextLoader(str(md_file), encoding="utf-8")
                documents.extend(loader.load())
            except Exception as exc:
                print(f"Warning: Could not load {md_file}: {exc}")

    # Load company-website.md from .github/
    company_website = GITHUB_DIR / "company-website.md"
    if company_website.exists():
        try:
            loader = TextLoader(str(company_website), encoding="utf-8")
            documents.extend(loader.load())
        except Exception as exc:
            print(f"Warning: Could not load {company_website}: {exc}")

    return documents


def split_documents(documents: list) -> list:
    """Split documents into chunks with configurable size and overlap.

    Args:
        documents: List of LangChain Document objects.

    Returns:
        List of chunked Document objects.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        separators=["\n## ", "\n### ", "\n#### ", "\n---", "\n\n", "\n", " ", ""],
        length_function=len,
    )
    return splitter.split_documents(documents)


def ingest_documents() -> int:
    """Full ingestion pipeline: load → split → embed → store.

    Returns:
        Number of chunks created and stored.
    """
    print("📄 Loading documents...")
    documents = load_documents()
    if not documents:
        print("⚠️  No documents found to ingest.")
        return 0

    print(f"✂️  Splitting {len(documents)} document(s) into chunks...")
    chunks = split_documents(documents)
    print(f"📦 Created {len(chunks)} chunks.")

    print("🧠 Generating embeddings and storing in ChromaDB...")
    vector_store = _get_vector_store()
    vector_store.add_documents(chunks)
    print("✅ Ingestion complete.")

    return len(chunks)


def get_vector_store() -> Chroma:
    """Public accessor for the vector store (used by retriever)."""
    return _get_vector_store()
