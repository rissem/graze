# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Lint/Test Commands
- Backend: `cd backend && ./scripts/lint.sh` (lint), `./scripts/test.sh` (test all)
- Run single test: `cd backend && pytest path/to/test.py::test_function -v`
- Frontend: `cd frontend && npm run lint` (lint), `npx playwright test` (test)
- Run dev: `cd frontend && npm run dev`

## Code Style
- Backend: Python 3.10+, strict typing (mypy), Ruff formatting
- Frontend: TypeScript, Biome (double quotes, space indentation)
- Use Tailwind CSS only for new work (not Chakra)
- Organize imports alphabetically
- Explicit error handling with type-safe patterns
- Follow existing patterns in neighboring files

## Important Notes
- Don't modify generated files (sdk.gen.ts, types.gen.ts)
- Ensure proper typing in both Python and TypeScript
- Follow FastAPI dependency injection patterns in backend
- Use React hooks patterns for frontend state management
- Always run linting before completing work