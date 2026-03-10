"""Retriever module — queries ChromaDB for relevant document chunks.

The retriever is decoupled from the generation layer so each can be
tested, swapped, or tuned independently.
"""

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

from config import settings


def _get_embeddings() -> HuggingFaceEmbeddings:
    """Return the configured HuggingFace embedding model."""
    return HuggingFaceEmbeddings(
        model_name=settings.embedding_model,
    )


def _get_vector_store() -> Chroma:
    """Return the ChromaDB vector store instance."""
    return Chroma(
        collection_name="rock_insurance",
        embedding_function=_get_embeddings(),
        persist_directory=settings.chroma_persist_dir,
    )


def retrieve_relevant_chunks(query: str, top_k: int | None = None) -> list[dict]:
    """Search the vector store for chunks relevant to the user query.

    Args:
        query: The user's natural-language question.
        top_k: Number of results to return (defaults to config value).

    Returns:
        List of dicts with 'content' and 'metadata' keys.
    """
    k = top_k or settings.retriever_top_k
    vector_store = _get_vector_store()
    results = vector_store.similarity_search_with_relevance_scores(query, k=k)

    chunks = []
    for doc, score in results:
        chunks.append({
            "content": doc.page_content,
            "metadata": doc.metadata,
            "score": round(score, 4),
        })

    return chunks


def retrieve_as_context(query: str, top_k: int | None = None) -> tuple[str, list[str]]:
    """Retrieve chunks and format them as a single context string.

    Args:
        query: The user's natural-language question.
        top_k: Number of results to return.

    Returns:
        Tuple of (combined_context_string, list_of_source_names).
    """
    chunks = retrieve_relevant_chunks(query, top_k)

    if not chunks:
        return "", []

    context_parts = []
    sources = []
    for i, chunk in enumerate(chunks, 1):
        source = chunk["metadata"].get("source", "Unknown")
        context_parts.append(f"[Source {i}: {source}]\n{chunk['content']}")
        if source not in sources:
            sources.append(source)

    combined_context = "\n\n---\n\n".join(context_parts)
    return combined_context, sources
