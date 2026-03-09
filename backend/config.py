"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration for the RAG backend."""

    # LLM
    openai_api_key: str = ""
    llm_model: str = "gpt-4"
    embedding_model: str = "text-embedding-ada-002"

    # Database
    database_url: str = "sqlite:///./rag.db"

    # Auth / JWT
    jwt_secret_key: str = "change-me-to-a-random-secret-string"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # Vector Store
    chroma_persist_dir: str = "./chroma_db"

    # Server
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    cors_origins: str = "http://localhost:3000"

    # RAG
    chunk_size: int = 1000
    chunk_overlap: int = 200
    retriever_top_k: int = 5

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
