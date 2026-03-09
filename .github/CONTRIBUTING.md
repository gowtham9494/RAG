# Contributing to RAG

Thank you for contributing to this project!

## Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. Create a new **branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Copy `.env.example` to `.env` and fill in your keys
5. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Development Workflow

- Keep commits small and focused
- Use clear commit messages: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Run tests before pushing:
  ```bash
  pytest tests/ -v
  ```
- Lint your code:
  ```bash
  flake8 src/ tests/ --max-line-length=120
  ```

## Submitting a PR

1. Push your branch to your fork
2. Open a Pull Request against `main`
3. Fill in the PR template
4. Wait for review

## Git Hooks (Optional but Recommended)

To set up local pre-commit hooks, install [pre-commit](https://pre-commit.com/):
```bash
pip install pre-commit
pre-commit install
```
This will auto-lint your code before every commit.

## Secrets & Environment Variables

- **Never** commit `.env` or any API keys
- Document all new env vars in `.env.example`
