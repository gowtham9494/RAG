# Code Review Feedback

## Critical Bug

- **Suggested questions don't work.** `ChatWindow.tsx:47` and `Sidebar.tsx:96` dispatch a `suggestedQuestion` CustomEvent, but `chat/page.tsx` never registers a listener for it. Clicking any suggested question or quick topic does nothing.

## Backend

- **Duplicate embeddings on re-ingest.** `loader.py:107` calls `vector_store.add_documents(chunks)` without clearing old data first. Each `/api/ingest` call adds duplicate chunks to ChromaDB.
- **Duplicate helper functions.** `_get_embeddings()` and `_get_vector_store()` are copy-pasted in both `loader.py` and `retriever.py`. Extract to a shared module.
- **EmailStr imported but unused.** `schemas.py:4` imports `EmailStr` but the `email` field on line 12 uses plain `str`. Switch to `EmailStr` for validation.
- **No admin guard on ingestion.** Any authenticated user can call `POST /api/ingest` and re-index the entire vector store. Should be admin-only.
- **Default JWT secret is insecure.** `config.py:18` defaults to `"change-me-to-a-random-secret-string"`. If no `.env` is provided the app runs with a guessable secret.

## Frontend

- **No token refresh or expiry handling.** JWT expires after 60 min. The frontend has no refresh logic — the user gets silently logged out on the next API call.
- **`api.ts` getChatHistory return type is `any[]`.** Should be typed to `ChatHistoryItem[]`.

## Data

- **`data/` directory is empty.** The RAG pipeline relies solely on `.github/company-website.md`. If you have additional policy docs, drop them into `data/` as `.md` files before running ingest.

## Setup Steps Before Running

1. Copy `.env.example` to `.env` in the project root (and in `backend/` if needed).
2. Set a real `OPENAI_API_KEY` and a strong random `JWT_SECRET_KEY`.
3. `cd backend && pip install -r requirements.txt`
4. `cd frontend && npm install`
5. Start backend: `cd backend && python main.py`
6. Start frontend: `cd frontend && npm run dev`
7. Sign up, then call `POST /api/ingest` (or add an ingest button) to load documents into ChromaDB before chatting.
