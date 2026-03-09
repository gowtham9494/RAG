# Rock Insurance RAG Portal — Complete Project Breakdown

---

## What Is This Project?

This is an **internal employee portal** for a fictional company called **Rock Insurance**. Employees can open a chat interface in their browser, type a question like *"What is the PTO policy?"* or *"Who is the CEO?"*, and get an AI-generated answer pulled directly from the company's own documents.

The technology behind it is called **RAG — Retrieval-Augmented Generation**. In plain terms:

1. Company documents (Markdown files) are chopped into small pieces and stored as numerical vectors in a database.
2. When an employee asks a question, the system finds the most relevant pieces.
3. Those pieces are sent to OpenAI's GPT-4 along with the question.
4. GPT-4 writes an answer using **only** that context — it does not make things up.

This means the AI assistant is grounded in real company data, not general internet knowledge.

---

## High-Level Architecture

```
┌──────────────┐        ┌──────────────────┐        ┌──────────────┐
│   Frontend   │──API──▶│     Backend      │──────▶ │   ChromaDB   │
│  (Next.js)   │◀──────│    (FastAPI)      │◀────── │ (Vector DB)  │
│  Port 3000   │        │    Port 8000     │        │  Local files  │
└──────────────┘        └──────────────────┘        └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   SQLite DB  │
                        │  (rag.db)    │
                        │ Users + Chat │
                        └──────────────┘
```

- **Frontend** — what the employee sees in the browser (chat UI, login, signup).
- **Backend** — the server that handles authentication, talks to the AI, and stores data.
- **ChromaDB** — a specialized database that stores document chunks as vectors for fast similarity search.
- **SQLite** — a simple file-based database that stores user accounts and chat history.

---

## Full Folder Structure & Purpose of Every File

```
RAG/
├── .claude/                          # Claude Code config
│   └── CLAUDE.md                     # Instructions for Claude Code AI assistant
│
├── .github/                          # GitHub-related files
│   ├── company-website.md            # THE main data source (1,427 lines of company content)
│   ├── CONTRIBUTING.md               # Rules for contributing code
│   ├── copilot-instructions.md       # Instructions for GitHub Copilot
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md             # Template for filing bugs
│   │   └── feature_request.md        # Template for requesting features
│   ├── pull_request_template.md      # Template for pull requests
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI pipeline (lint, test, build)
│
├── backend/                          # Python server (FastAPI)
│   ├── main.py                       # App entry point — all API routes live here
│   ├── auth.py                       # Password hashing + JWT token logic
│   ├── config.py                     # Loads settings from .env file
│   ├── database.py                   # SQLAlchemy database connection setup
│   ├── models.py                     # Database table definitions (User, ChatHistory)
│   ├── schemas.py                    # Request/response data shapes (validation)
│   ├── requirements.txt              # Python package list
│   ├── pytest.ini                    # Pytest configuration
│   ├── ingestion/                    # Step 1 of RAG: loading documents
│   │   ├── __init__.py               # Makes this a Python package
│   │   └── loader.py                 # Reads .md files, chunks them, stores in ChromaDB
│   ├── retrieval/                    # Step 2 of RAG: finding relevant chunks
│   │   ├── __init__.py
│   │   └── retriever.py              # Searches ChromaDB for chunks matching a question
│   └── generation/                   # Step 3 of RAG: generating the answer
│       ├── __init__.py
│       └── generator.py              # Sends context + question to GPT-4, returns answer
│
├── frontend/                         # Browser app (Next.js + React)
│   ├── package.json                  # Node.js dependencies and scripts
│   ├── next.config.js                # Next.js config (API proxy to backend)
│   ├── postcss.config.js             # PostCSS config (required by Tailwind)
│   ├── tailwind.config.ts            # Tailwind CSS theme (custom "rock" color palette)
│   ├── tsconfig.json                 # TypeScript compiler settings
│   └── src/
│       ├── app/
│       │   ├── layout.tsx            # Root HTML wrapper (applies to every page)
│       │   ├── page.tsx              # Home "/" — redirects to /chat or /login
│       │   ├── globals.css           # Global styles (markdown rendering, scrollbars)
│       │   ├── login/
│       │   │   └── page.tsx          # Login form page
│       │   ├── signup/
│       │   │   └── page.tsx          # Signup/registration form page
│       │   └── chat/
│       │       └── page.tsx          # Main chat page (sends questions, shows answers)
│       ├── components/
│       │   ├── ChatWindow.tsx        # Displays messages, welcome screen, loading dots
│       │   └── Sidebar.tsx           # Left sidebar with quick topics, user info, logout
│       └── lib/
│           └── api.ts                # All API calls to the backend (typed)
│
├── data/                             # Extra documents for the RAG pipeline
│   └── .gitkeep                      # Placeholder (folder is empty — add .md files here)
│
├── tests/                            # Backend test suite
│   ├── test_auth.py                  # Tests for signup/login/token endpoints
│   └── test_ingestion.py             # Tests for document ingestion
│
├── .env.example                      # Template for environment variables
├── .gitignore                        # Files excluded from git
└── README.md                         # Project overview and setup guide
```

---

## Deep Dive: Backend

### `main.py` — The Central Hub

This is the FastAPI application. It defines every API route (URL endpoint) the frontend can call:

| Route | Method | Auth? | What It Does |
|---|---|---|---|
| `/api/auth/signup` | POST | No | Creates a new user account, returns JWT token |
| `/api/auth/login` | POST | No | Validates credentials, returns JWT token |
| `/api/auth/me` | GET | Yes | Returns the logged-in user's profile |
| `/api/chat` | POST | Yes | Accepts a question, runs the RAG pipeline, returns an AI answer |
| `/api/chat/history` | GET | Yes | Returns past questions and answers for the user |
| `/api/ingest` | POST | Yes | Triggers document loading into ChromaDB |
| `/api/health` | GET | No | Returns `{"status": "healthy"}` — used for monitoring |

On startup it initializes the database tables (via `lifespan`) and sets up CORS so the frontend at `localhost:3000` can talk to the backend at `localhost:8000`.

### `auth.py` — Security Layer

Handles two things:
- **Password hashing**: Uses bcrypt so passwords are never stored in plain text. When you sign up, your password becomes something like `$2b$12$LJ3...` in the database.
- **JWT tokens**: After login, the server creates a signed token (a long encoded string) that the frontend sends with every request. The token proves who you are without needing to send your password again. Expires after 60 minutes.

### `config.py` — Settings

Uses Pydantic Settings to load environment variables from a `.env` file. Every configurable value (API keys, database path, chunk sizes, etc.) lives here. If a variable isn't set, it falls back to a default.

### `database.py` — Database Connection

Sets up SQLAlchemy to talk to SQLite. Creates a `SessionLocal` factory that produces database sessions. The `get_db` function is a FastAPI dependency — it opens a session for each request and closes it after.

### `models.py` — Database Tables

Defines two tables:
- **`users`** — id, username, email, hashed_password, full_name, created_at
- **`chat_history`** — id, session_id, user_id, question, answer, sources, created_at

A user has many chat history entries (one-to-many relationship).

### `schemas.py` — Data Validation

Pydantic models that validate incoming requests and shape outgoing responses:
- `SignupRequest` — ensures username is 3-50 chars, password is 6+ chars
- `LoginRequest` — just username + password
- `ChatRequest` — question must be 1-2000 chars
- `ChatResponse` — answer text + source list + session ID
- etc.

### `ingestion/loader.py` — Document Loading (RAG Step 1)

This is the "data preparation" step. It:
1. **Loads** all `.md` files from `data/` and `.github/company-website.md`
2. **Splits** them into overlapping chunks of ~1000 characters each. Overlap (200 chars) ensures context isn't lost at boundaries. Splits prefer to break at headings (`## `, `### `) for cleaner chunks.
3. **Embeds** each chunk — sends it to OpenAI's embedding model which converts text into a 1536-dimension number array (a vector).
4. **Stores** those vectors in ChromaDB on disk.

You only run this once (or whenever documents change).

### `retrieval/retriever.py` — Finding Relevant Chunks (RAG Step 2)

When a question comes in:
1. The question is converted to a vector (same embedding model).
2. ChromaDB finds the 5 most similar stored chunks using cosine similarity.
3. Returns those chunks along with their source file names.

### `generation/generator.py` — Generating the Answer (RAG Step 3)

Takes the retrieved chunks + the employee's question and:
1. Builds a prompt with a system instruction: *"Answer ONLY from the provided context."*
2. Sends it to GPT-4 with temperature 0.1 (very factual, low creativity).
3. Returns the answer text and the source list.

If no relevant chunks are found, it returns a fallback message directing the user to the help desk.

---

## Deep Dive: Frontend

### `page.tsx` (Root `/`)

A simple redirect page. Checks if a JWT token exists in `localStorage`:
- Token exists → go to `/chat`
- No token → go to `/login`

### `login/page.tsx`

A form with username and password fields. On submit:
1. Calls `api.login(username, password)`
2. Stores the returned token, username, and full name in `localStorage`
3. Redirects to `/chat`

### `signup/page.tsx`

A registration form with full name, username, email, password, and confirm password. Validates:
- Passwords match
- Password is at least 6 characters

On success, auto-logs in and redirects to `/chat`.

### `chat/page.tsx` — The Main Page

This is the core of the app. It manages:
- **Message state**: An array of `Message` objects (user and assistant messages)
- **Session tracking**: Each conversation gets a unique `session_id`
- **Input handling**: A textarea that expands as you type, sends on Enter
- **API calls**: Sends the question to `/api/chat`, receives answer + sources
- **Error handling**: If the token expires (401), clears storage and redirects to login

### `ChatWindow.tsx` — Message Display

Two modes:
- **Empty state**: Shows a welcome screen with 6 clickable suggested questions
- **Chat mode**: Renders each message as a bubble:
  - User messages: blue (rock-600), right-aligned
  - Assistant messages: white with border, left-aligned, rendered as Markdown
  - Shows source files below each AI response
  - Animated loading dots while waiting for a response
  - Auto-scrolls to the newest message

### `Sidebar.tsx` — Navigation Panel

A dark sidebar on the left with:
- Rock Insurance branding
- "New Chat" button (clears the conversation)
- 10 quick topic buttons (Benefits, PTO, Handbook, Remote Work, etc.)
- User profile section at the bottom with avatar, name, and logout button
- Can be collapsed/expanded

### `lib/api.ts` — API Client

A centralized module with typed functions for every backend call:
- `signup()`, `login()`, `chat()`, `getChatHistory()`, `ingest()`, `health()`
- All requests go to `/api/...` which Next.js proxies to `localhost:8000`
- Error handling extracts `detail` from FastAPI error responses

### `next.config.js` — API Proxy

Configures Next.js rewrites so that frontend requests to `/api/*` are forwarded to the backend at `http://localhost:8000/api/*`. This avoids CORS issues during development.

### `tailwind.config.ts` — Theme

Defines the custom `rock` color palette (blue shades from light `rock-50` to dark `rock-900`). The primary color `rock-600` (#4c6ef5) is used for buttons, user message bubbles, and accents throughout the app.

### `globals.css` — Global Styles

Styles for rendered Markdown content (headings, lists, tables, code blocks, blockquotes), custom scrollbar appearance, and CSS variables for theming.

---

## Deep Dive: Data

### `.github/company-website.md` — The Knowledge Base

This is the single most important file. It contains 1,427 lines of Rock Insurance company content organized into sections:

- **Home Page** — Top stories, industry news, hiring, events, business results
- **Company Info** — Founded 1978, 12,000+ employees, mission, values
- **Employee Resources** — Benefits portal, forms, handbook
- **Benefits** — Medical (PPO, HDHP), dental, vision, 401(k), HSA/FSA, life insurance
- **HR Policies** — PTO accrual, holidays, sick leave, parental leave, FMLA
- **Onboarding** — Pre-day checklist, Day 1 schedule, 30-day training plan
- **Leadership** — Full executive team (CEO, CFO, CTO, etc.)
- **IT Policies** — VPN, passwords, BYOD, software requests
- **Training** — Learning paths, certifications, tuition reimbursement
- **Office Locations** — Columbus HQ, Phoenix regional
- **Claims Process** — 8-step lifecycle
- **Compliance** — Regulatory requirements
- **Vendor Directory** — Third-party partners
- **Company History** — Milestones from 1978 to present

This file gets chunked and embedded into ChromaDB during ingestion. Every answer the AI gives comes from this content.

### `data/` — Additional Documents

Currently empty. You can place extra `.md` files here (e.g., department-specific guides, product manuals) and they will be included in the next ingestion run.

---

## How Data Flows End-to-End

### One-time Setup: Ingestion
```
.github/company-website.md ──▶ loader.py reads it
         + data/*.md            │
                                ▼
                         Split into ~1000 char chunks
                                │
                                ▼
                         OpenAI Embedding API converts each chunk to a vector
                                │
                                ▼
                         ChromaDB stores vectors + original text on disk
```

### Every Chat Message
```
Employee types: "What is the PTO policy?"
         │
         ▼
Frontend (chat/page.tsx) ──POST /api/chat──▶ Backend (main.py)
                                                   │
                                                   ▼
                                            retriever.py
                                            - Embeds the question
                                            - Searches ChromaDB
                                            - Returns top 5 matching chunks
                                                   │
                                                   ▼
                                            generator.py
                                            - Builds prompt with chunks + question
                                            - Calls GPT-4
                                            - Gets answer
                                                   │
                                                   ▼
                                            main.py saves to chat_history table
                                                   │
                                                   ▼
Frontend receives: { answer: "Rock Insurance offers...", sources: ["company-website.md"] }
         │
         ▼
ChatWindow.tsx renders the answer as Markdown with source attribution
```

---

## Key Technologies Explained

| Technology | Role | Why It's Used |
|---|---|---|
| **Next.js 14** | Frontend framework | Server-side rendering, file-based routing, API proxy |
| **React 18** | UI library | Component-based UI, state management |
| **TypeScript** | Type safety | Catches errors at compile time |
| **Tailwind CSS** | Styling | Utility-first CSS, fast to build UIs |
| **FastAPI** | Backend framework | Fast, async Python web framework with auto-docs |
| **SQLAlchemy** | ORM | Maps Python classes to database tables |
| **SQLite** | Database | Simple file-based DB, no server needed |
| **LangChain** | AI orchestration | Chains together document loading, splitting, embedding, LLM calls |
| **OpenAI GPT-4** | Language model | Generates natural language answers |
| **OpenAI Embeddings** | Text-to-vector | Converts text to numerical vectors for similarity search |
| **ChromaDB** | Vector database | Stores and searches document embeddings locally |
| **JWT (JSON Web Tokens)** | Authentication | Stateless auth tokens, no server-side sessions needed |
| **bcrypt** | Password hashing | Industry-standard one-way password encryption |

---

## Environment Variables (`.env`)

| Variable | What It Controls |
|---|---|
| `OPENAI_API_KEY` | Your OpenAI API key (required — nothing works without this) |
| `LLM_MODEL` | Which OpenAI model to use (default: `gpt-4`) |
| `EMBEDDING_MODEL` | Embedding model (default: `text-embedding-ada-002`) |
| `DATABASE_URL` | SQLite path (default: `sqlite:///./rag.db`) |
| `JWT_SECRET_KEY` | Secret for signing tokens (change this!) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime (default: 60) |
| `CHROMA_PERSIST_DIR` | Where ChromaDB stores data on disk |
| `BACKEND_HOST` / `BACKEND_PORT` | Server binding (default: `0.0.0.0:8000`) |
| `CORS_ORIGINS` | Allowed frontend origins |
| `CHUNK_SIZE` / `CHUNK_OVERLAP` | How documents are split (1000/200 chars) |
| `RETRIEVER_TOP_K` | How many chunks to retrieve per question (default: 5) |
