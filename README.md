# Rock Insurance — Employee Portal AI (RAG)

A full-stack **Retrieval-Augmented Generation** system built on top of the Rock Insurance company website. Employees can ask natural-language questions and receive answers grounded in company content.

---

## Tech Stack

| Layer       | Technology                                    |
| ----------- | --------------------------------------------- |
| Frontend    | Next.js 14 (App Router), React 18, Tailwind   |
| Backend     | Python 3.11+, FastAPI, Uvicorn                |
| Database    | SQLite via SQLAlchemy 2.0                     |
| Auth        | JWT (python-jose) + bcrypt (passlib)          |
| RAG         | LangChain 0.3, OpenAI Embeddings, ChromaDB   |

---

## Project Structure

```
RAG/
├── .github/
│   └── company-website.md      # Source knowledge document
├── backend/
│   ├── config.py               # Centralized settings (pydantic-settings)
│   ├── database.py             # SQLAlchemy engine & session
│   ├── models.py               # User & ChatHistory ORM models
│   ├── auth.py                 # JWT helpers & FastAPI dependency
│   ├── schemas.py              # Pydantic request / response models
│   ├── main.py                 # FastAPI app & routes
│   ├── ingestion/              # Document loading & chunking
│   ├── retrieval/              # Vector similarity search
│   ├── generation/             # LLM prompt & response
│   └── requirements.txt
├── frontend/
│   ├── src/app/                # Next.js pages (login, signup, chat)
│   ├── src/components/         # ChatWindow, Sidebar
│   ├── src/lib/api.ts          # API client
│   └── package.json
├── data/                       # Additional documents for ingestion
├── tests/                      # Pytest test suite
├── .env.example                # Environment variable template
└── README.md
```

---

## Getting Started

### 1. Clone & configure environment variables

```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY, JWT_SECRET_KEY, etc.
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Start the API server:

```bash
uvicorn main:app --reload --port 8000
```

### 3. Ingest documents

After the server is running, ingest the company website into the vector store:

```bash
curl -X POST http://localhost:8000/api/ingest
```

Or use the UI (admin action).

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app opens at **http://localhost:3000**. API calls are proxied to `localhost:8000` via Next.js rewrites.

---

## API Endpoints

| Method | Path                 | Auth | Description                    |
| ------ | -------------------- | ---- | ------------------------------ |
| POST   | `/api/auth/signup`   | No   | Register a new user            |
| POST   | `/api/auth/login`    | No   | Login & receive JWT token      |
| GET    | `/api/auth/me`       | Yes  | Get current user profile       |
| POST   | `/api/chat`          | Yes  | Ask a question (RAG pipeline)  |
| GET    | `/api/chat/history`  | Yes  | Get chat history for a session |
| POST   | `/api/ingest`        | No   | Ingest documents into ChromaDB |
| GET    | `/api/health`        | No   | Health check                   |

---

## Running Tests

```bash
cd backend
pytest
```

---

## Environment Variables

See `.env.example` for the full list. Key variables:

- `OPENAI_API_KEY` — Required for embeddings & LLM
- `JWT_SECRET_KEY` — Secret for signing JWT tokens
- `DATABASE_URL` — SQLite connection string (default: `sqlite:///./rag.db`)
- `CHROMA_PERSIST_DIR` — ChromaDB storage directory

---

## License

Internal use — Rock Insurance © 2024
