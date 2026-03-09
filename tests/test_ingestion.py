"""Tests for the ingestion / loader module."""

import pytest
from pathlib import Path

from ingestion.loader import load_documents, split_documents


class TestDocumentLoading:
    """Tests for the document loading pipeline."""

    def test_load_company_website(self):
        """The company-website.md file is loadable."""
        docs = load_documents()
        assert len(docs) > 0, "Expected at least one document to be loaded"

    def test_documents_have_content(self):
        """Loaded documents contain non-empty content."""
        docs = load_documents()
        for doc in docs:
            assert len(doc.page_content) > 0, "Document content should not be empty"

    def test_split_documents_creates_chunks(self):
        """Splitting creates multiple chunks from a large document."""
        docs = load_documents()
        if not docs:
            pytest.skip("No documents available to test splitting")
        chunks = split_documents(docs)
        assert len(chunks) > len(docs), "Splitting should produce more chunks than documents"

    def test_chunks_have_metadata(self):
        """Each chunk retains source metadata."""
        docs = load_documents()
        if not docs:
            pytest.skip("No documents available")
        chunks = split_documents(docs)
        for chunk in chunks:
            assert "source" in chunk.metadata, "Chunk should have 'source' metadata"
