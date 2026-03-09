"""Rock Insurance RAG API — FastAPI application entry point."""

import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from config import settings
from database import get_db, init_db
from models import ChatHistory, User
from auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from schemas import (
    ChatHistoryItem,
    ChatRequest,
    ChatResponse,
    IngestResponse,
    LoginRequest,
    SignupRequest,
    TokenResponse,
    UserResponse,
)
from ingestion.loader import ingest_documents
from generation.generator import generate_answer


# ── Lifespan: initialise DB on startup ────────────────────────

def _seed_demo_user():
    """Create a demo/demo user if it doesn't already exist."""
    from database import SessionLocal
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.username == "demo").first():
            db.add(User(
                username="demo",
                email="demo@rockinsurance.com",
                hashed_password=hash_password("demo"),
                full_name="Demo User",
            ))
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup / shutdown tasks."""
    init_db()
    _seed_demo_user()
    yield


# ── App instance ──────────────────────────────────────────────

app = FastAPI(
    title="Rock Insurance RAG API",
    description="Retrieval-Augmented Generation API for the Rock Insurance internal portal.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ══════════════════════════════════════════════════════════════
#  AUTH ROUTES
# ══════════════════════════════════════════════════════════════

@app.post("/api/auth/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    """Register a new user account."""
    # Check for existing user
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.username})
    return TokenResponse(
        access_token=token,
        username=user.username,
        full_name=user.full_name,
    )


@app.post("/api/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate and return a JWT token."""
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token(data={"sub": user.username})
    return TokenResponse(
        access_token=token,
        username=user.username,
        full_name=user.full_name,
    )


@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return current_user


# ══════════════════════════════════════════════════════════════
#  RAG / CHAT ROUTES
# ══════════════════════════════════════════════════════════════

@app.post("/api/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit a question and receive a RAG-generated answer."""
    result = generate_answer(payload.question)
    session_id = payload.session_id or str(uuid.uuid4())

    # Persist to chat history
    history_entry = ChatHistory(
        session_id=session_id,
        user_id=current_user.id,
        question=payload.question,
        answer=result["answer"],
        sources=", ".join(result["sources"]) if result["sources"] else None,
    )
    db.add(history_entry)
    db.commit()

    return ChatResponse(
        answer=result["answer"],
        sources=result["sources"],
        session_id=session_id,
    )


@app.get("/api/chat/history", response_model=list[ChatHistoryItem])
def get_chat_history(
    session_id: str | None = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve chat history for the current user."""
    query = db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id)
    if session_id:
        query = query.filter(ChatHistory.session_id == session_id)
    return query.order_by(ChatHistory.created_at.desc()).limit(limit).all()


# ══════════════════════════════════════════════════════════════
#  INGESTION ROUTES
# ══════════════════════════════════════════════════════════════

@app.post("/api/ingest", response_model=IngestResponse)
def ingest(current_user: User = Depends(get_current_user)):
    """Trigger document ingestion into the vector store."""
    try:
        chunks_created = ingest_documents()
        return IngestResponse(
            message="Documents ingested successfully.",
            chunks_created=chunks_created,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Ingestion failed: {str(exc)}",
        )


# ══════════════════════════════════════════════════════════════
#  PORTAL — serve raw markdown (no OpenAI needed)
# ══════════════════════════════════════════════════════════════

PROJECT_ROOT = Path(__file__).resolve().parent.parent
COMPANY_WEBSITE_PATH = PROJECT_ROOT / ".github" / "company-website.md"


@app.get("/api/portal", response_class=PlainTextResponse)
def get_portal_content():
    """Return the company-website.md content as plain text/markdown."""
    if not COMPANY_WEBSITE_PATH.exists():
        raise HTTPException(status_code=404, detail="Company website content not found")
    return COMPANY_WEBSITE_PATH.read_text(encoding="utf-8")


# ══════════════════════════════════════════════════════════════
#  HEALTH CHECK
# ══════════════════════════════════════════════════════════════

@app.get("/api/health")
def health_check():
    """Simple health check endpoint."""
    return {"status": "healthy", "service": "Rock Insurance RAG API"}


# ── Run with: python main.py ─────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=True,
    )
