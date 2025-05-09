# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Setup & Installation

### Backend

- Install dependencies: `cd backend && uv sync`
- Activate virtual environment: `source .venv/bin/activate`
- Docker Compose is available for local development

### Frontend

- Install dependencies: `cd frontend && npm install`
- Development server: `cd frontend && npm run dev`
- Access at http://localhost:5173/

## Build/Lint/Test Commands

- Backend: `cd backend && ./scripts/lint.sh` (lint), `./scripts/test.sh` (test all)
- Run single test: `cd backend && pytest path/to/test.py::test_function -v`
- Frontend: `cd frontend && npm run lint` (lint), `npx playwright test` (test)
- Run dev: `cd frontend && npm run dev`

## Code Structure

- Backend:
  - `./backend/app/`: Main application code
  - `./backend/app/api/`: API endpoints
  - `./backend/app/models.py`: Database models
  - `./backend/app/tests/`: Test files
- Frontend:
  - `./frontend/src/`: Main frontend code
  - `./frontend/src/components/`: React components
  - `./frontend/src/routes/`: Page routing
  - `./frontend/src/client/`: Generated API client

## Code Style

- Backend: Python 3.10+, strict typing (mypy), Ruff formatting
- Frontend: TypeScript, Biome (double quotes, space indentation)
- Use Tailwind CSS only for new work (not Chakra)
- Organize imports alphabetically
- Explicit error handling with type-safe patterns
- Follow existing patterns in neighboring files

## Development Workflow

- Modify backend models in `./backend/app/models.py`
- Create/apply migrations with Alembic when models change
- Add new API endpoints in `./backend/app/api/`
- Frontend API client can be generated from OpenAPI schema

## Important Notes

- Don't modify generated files (sdk.gen.ts, types.gen.ts)
- Ensure proper typing in both Python and TypeScript
- Follow FastAPI dependency injection patterns in backend
- Use React hooks patterns for frontend state management
- Always run linting before completing work
