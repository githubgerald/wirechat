# lain

Meme Server Potential.

## Prerequisites

Install [uv](https://astral.sh/uv) for package management.

This project also uses `ruff` for code formatting and linting, and optionally `pre-commit` for additional checks.

## Getting Started

1. **Install dependencies:**
   ```bash
   uv sync --all-extras
   uv run pre-commit install
   ```

2. **Run the server:**
   ```bash
   uv run chat_server.py
   ```

## Extras

**Format code:**
```bash
uv run ruff format .
```

**Lint code:**
```bash
uv run ruff check .
```

**Auto-fix issues:**
```bash
uv run ruff check --fix .
```

## Common Commands

- `uv sync` - Install dependencies
- `uv add <package>` - Add a dependency
- `uv run <command>` - Run a command in the project environment
