"""Pydantic request / response schemas."""

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# ── Auth schemas ──────────────────────────────────────────────

class SignupRequest(BaseModel):
    """Payload for user registration."""
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., max_length=120)
    password: str = Field(..., min_length=6)
    full_name: str | None = None


class LoginRequest(BaseModel):
    """Payload for user login."""
    username: str
    password: str


class TokenResponse(BaseModel):
    """JWT token returned after login / signup."""
    access_token: str
    token_type: str = "bearer"
    username: str
    full_name: str | None = None


class UserResponse(BaseModel):
    """Public user info."""
    id: int
    username: str
    email: str
    full_name: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Chat / RAG schemas ───────────────────────────────────────

class ChatRequest(BaseModel):
    """User question submitted to the RAG pipeline."""
    question: str = Field(..., min_length=1, max_length=2000)
    session_id: str | None = None


class ChatResponse(BaseModel):
    """RAG-generated answer returned to the client."""
    answer: str
    sources: list[str] = []
    session_id: str


class ChatHistoryItem(BaseModel):
    """Single chat exchange for history display."""
    id: int
    question: str
    answer: str
    sources: str | None = None
    created_at: datetime
    session_id: str

    class Config:
        from_attributes = True


# ── Ingestion schemas ────────────────────────────────────────

class IngestResponse(BaseModel):
    """Response after document ingestion."""
    message: str
    chunks_created: int
