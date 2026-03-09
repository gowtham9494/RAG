# Copilot Instructions

## Project Overview
This is a **RAG (Retrieval-Augmented Generation)** system built on top of a Company website.
It enables users to ask natural language questions and get answers grounded in company content.

## Tech Stack
- **Language:** Python
- **RAG Framework:** LangChain / LlamaIndex (update as applicable)
- **Vector Store:** (e.g., Chroma, Pinecone, Azure AI Search)
- **LLM:** (e.g., OpenAI GPT-4, Azure OpenAI)
- **Embedding Model:** (e.g., text-embedding-ada-002)

## Project Structure
```
RAG/
├── .github/              # GitHub config, workflows, templates
├── data/                 # Raw and processed documents
├── src/                  # Core source code
│   ├── ingestion/        # Document loading & chunking
│   ├── retrieval/        # Vector search & retrieval logic
│   ├── generation/       # LLM prompt & response generation
│   └── api/              # API layer (FastAPI / Flask)
├── tests/                # Unit and integration tests
├── .env.example          # Environment variable template
└── README.md
```

## Coding Conventions
- Use **type hints** for all function signatures
- Write **docstrings** for all public functions and classes
- Follow **PEP8** style guidelines
- Keep functions small and single-responsibility
- Use **environment variables** for all API keys and secrets — never hardcode them

## Key Guidelines
- All document ingestion must go through the `src/ingestion/` module
- Retrieval logic must be decoupled from generation logic
- Prompts should be stored as templates, not hardcoded strings
- Every new feature should have a corresponding test in `tests/`
- Use `.env.example` to document any new environment variables added

## What to Avoid
- Do NOT commit `.env` files or any secrets
- Do NOT use synchronous blocking calls in async contexts
- Do NOT hardcode chunk sizes or model names — use config/constants

