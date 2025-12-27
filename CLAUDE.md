# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Full Stack FastAPI template application with RSS feed management capabilities. It combines a FastAPI backend with a React frontend, featuring user authentication, CRUD operations, and real-time feed subscriptions.

**Key Technologies:**
- Backend: FastAPI, SQLModel, PostgreSQL, Alembic, Pydantic
- Frontend: React, TypeScript, Vite, TanStack Router, Chakra UI + Tailwind CSS
- Development: Docker Compose, uv (Python), npm (Node.js)
- Testing: Pytest (backend), Playwright (frontend)
- CI/CD: GitHub Actions, pre-commit hooks

## Setup & Installation

### Backend

1. Install dependencies: `cd backend && uv sync`
2. Activate virtual environment: `source backend/.venv/bin/activate`
3. Configure environment: Copy `.env.example` to `.env` and update values
4. Run migrations: `cd backend && alembic upgrade head`

**Environment variables to configure:**
- `SECRET_KEY`: Generate with `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- `FIRST_SUPERUSER_PASSWORD`: Set secure admin password
- `POSTGRES_PASSWORD`: Set database password
- Database connection: `POSTGRES_SERVER`, `POSTGRES_USER`, `POSTGRES_DB`

### Frontend

1. Install dependencies: `cd frontend && npm install`
2. Generate API client (if needed): `npm run generate-client`
3. Start dev server: `npm run dev`
4. Access at: http://localhost:5173/

### Docker Compose (Recommended for Local Development)

1. Start all services: `docker compose watch`
2. Access points:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API docs (Swagger): http://localhost:8000/docs
   - Adminer (DB): http://localhost:8080
   - Traefik UI: http://localhost:8090

## Build/Lint/Test Commands

### Backend

- **Lint**: `cd backend && ./scripts/lint.sh` (runs mypy, ruff check, ruff format)
- **Format**: `cd backend && ruff format app`
- **Test all**: `cd backend && ./scripts/test.sh` (runs pytest with coverage)
- **Test single**: `cd backend && pytest path/to/test.py::test_function -v`
- **Type check**: `cd backend && mypy app`
- **Run dev server**: `cd backend && fastapi dev app/main.py`

### Frontend

- **Lint**: `cd frontend && npm run lint` (runs Biome)
- **Build**: `cd frontend && npm run build`
- **Test**: `cd frontend && npx playwright test`
- **Dev server**: `cd frontend && npm run dev`
- **Generate API client**: `cd frontend && npm run generate-client`

### Pre-commit Hooks

- **Install**: `uv run pre-commit install` (from repo root)
- **Run manually**: `uv run pre-commit run --all-files`
- Automatically runs on commit: checks TOML/YAML, runs ruff, biome

## Code Structure

### Backend (`./backend/app/`)

```
app/
├── main.py                    # FastAPI app initialization
├── models.py                  # SQLModel database models (User, Item, Feed)
├── crud.py                    # Database CRUD operations
├── utils.py                   # Utility functions (email, etc.)
├── core/
│   ├── config.py              # Pydantic settings (env vars)
│   ├── db.py                  # Database session management
│   └── security.py            # Password hashing, JWT tokens
├── api/
│   ├── main.py                # API router aggregation
│   ├── deps.py                # FastAPI dependencies (auth, DB)
│   └── routes/
│       ├── login.py           # Authentication endpoints
│       ├── users.py           # User management
│       ├── items.py           # Item CRUD
│       ├── feeds.py           # Feed management & subscriptions
│       ├── private.py         # Private endpoints
│       └── utils.py           # Route utilities
├── alembic/                   # Database migrations
│   ├── versions/              # Migration files
│   └── env.py                 # Alembic configuration
├── tests/                     # Test suite
│   ├── api/                   # API endpoint tests
│   ├── crud/                  # CRUD operation tests
│   ├── utils/                 # Utility tests
│   └── conftest.py            # Pytest fixtures
└── email-templates/           # HTML email templates
```

### Frontend (`./frontend/src/`)

```
src/
├── main.tsx                   # App entry point
├── theme.tsx                  # Chakra UI theme config
├── utils.ts                   # Utility functions
├── components/
│   ├── Common/                # Shared UI components
│   ├── Admin/                 # Admin panel components
│   ├── Items/                 # Item management UI
│   ├── Pending/               # Pending items UI
│   ├── UserSettings/          # User settings UI
│   └── ui/                    # Base UI components
├── routes/                    # TanStack Router pages
├── client/                    # Generated API client (DO NOT EDIT)
│   ├── sdk.gen.ts             # Generated SDK
│   ├── types.gen.ts           # Generated TypeScript types
│   └── schemas.gen.ts         # Generated schemas
├── hooks/                     # React custom hooks
├── theme/                     # Theme customization
└── routeTree.gen.ts           # Generated route tree (DO NOT EDIT)
```

## Code Style

### Backend (Python)

- **Python version**: 3.10+
- **Type checking**: Strict mypy enabled
- **Formatting**: Ruff (enforced via pre-commit)
- **Import sorting**: Alphabetical (Ruff handles this)
- **Linting rules**: pycodestyle (E/W), pyflakes (F), isort (I), flake8-bugbear (B)
- **Exclude from checks**: `venv`, `.venv`, `alembic`

**Key conventions:**
- Use type hints everywhere (strict mypy mode)
- Use SQLModel for database models (combines Pydantic + SQLAlchemy)
- Use Pydantic models for request/response validation
- Follow FastAPI dependency injection pattern
- Use `UUID` for primary keys (not integers)
- Use `datetime.now(timezone.utc)` for timestamps

### Frontend (TypeScript)

- **TypeScript**: Strict mode enabled
- **Formatting**: Biome (double quotes, space indentation, semicolons as needed)
- **Import organization**: Alphabetical (Biome handles this)
- **Generated files**: NEVER edit files in `src/client/` or `routeTree.gen.ts`

**Key conventions:**
- Use TanStack Router for routing
- Use TanStack Query for data fetching
- Use Chakra UI v3 components for existing features
- Use Tailwind CSS for NEW features (migration in progress)
- Use React hooks (functional components only)
- Use TypeScript types from generated client

## Development Workflow

### Database Changes

1. Modify models in `./backend/app/models.py`
2. Generate migration: `cd backend && alembic revision --autogenerate -m "description"`
3. Review migration in `./backend/app/alembic/versions/`
4. Apply migration: `alembic upgrade head`
5. Test rollback: `alembic downgrade -1` then `alembic upgrade head`

### Adding Backend API Endpoints

1. Define request/response models in `./backend/app/models.py`
2. Add CRUD functions in `./backend/app/crud.py` (if needed)
3. Create route in `./backend/app/api/routes/`
4. Register route in `./backend/app/api/main.py`
5. Write tests in `./backend/app/tests/api/`
6. Run tests: `./scripts/test.sh`

### Frontend API Client Generation

When backend API changes:
1. Start backend: `cd backend && fastapi dev app/main.py`
2. Download OpenAPI schema: `cd frontend && curl -o openapi.json http://localhost:8000/api/v1/openapi.json`
3. Generate client: `npm run generate-client`
4. Commit generated files (sdk.gen.ts, types.gen.ts, schemas.gen.ts)

### Docker Development Workflow

- Start services with live reload: `docker compose watch`
- Stop specific service: `docker compose stop <service>`
- View logs: `docker compose logs -f <service>`
- Rebuild after dependency changes: `docker compose up --build`

## Important Notes

### Generated Files (DO NOT EDIT)

- `frontend/src/client/*.gen.ts` - Generated from OpenAPI schema
- `frontend/src/routeTree.gen.ts` - Generated by TanStack Router
- `backend/app/alembic/versions/*.py` - Only edit fresh migrations

### Security Best Practices

- NEVER commit `.env` file
- Change `SECRET_KEY`, `FIRST_SUPERUSER_PASSWORD`, `POSTGRES_PASSWORD` from defaults
- Use environment variables for secrets in CI/CD
- Validate all user input with Pydantic models
- Use proper SQL injection protection (SQLModel handles this)

### Type Safety

- Backend: Strict mypy typing required
- Frontend: Use generated TypeScript types from API client
- Don't use `any` types unless absolutely necessary
- Prefer explicit type annotations over inference for public APIs

### Testing Requirements

- Write tests for all new API endpoints
- Backend: Use pytest fixtures from `conftest.py`
- Frontend: Use Playwright for E2E tests
- Aim for high coverage (run `./scripts/test.sh` to see coverage)

### Common Patterns

**Backend dependency injection:**
```python
from app.api.deps import CurrentUser, SessionDep

@router.get("/endpoint")
def endpoint(session: SessionDep, current_user: CurrentUser):
    # session: database session
    # current_user: authenticated user
    pass
```

**Frontend API calls:**
```typescript
import { UsersService } from "@/client/sdk.gen"
import { useQuery } from "@tanstack/react-query"

const { data } = useQuery({
  queryKey: ["users"],
  queryFn: () => UsersService.readUsers()
})
```

## URLs Reference

### Local Development

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs
- API Docs (ReDoc): http://localhost:8000/redoc
- Adminer (PostgreSQL): http://localhost:8080
- Traefik UI: http://localhost:8090
- MailCatcher: http://localhost:1080

### Alternative Domain (localhost.tiangolo.com)

Set `DOMAIN=localhost.tiangolo.com` in `.env` to use subdomain routing:
- Frontend: http://dashboard.localhost.tiangolo.com
- Backend: http://api.localhost.tiangolo.com
- API Docs: http://api.localhost.tiangolo.com/docs

## Additional Resources

- Backend docs: `./backend/README.md`
- Development guide: `./development.md`
- Deployment guide: `./deployment.md`
- Release notes: `./release-notes.md`
