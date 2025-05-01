# Project Organization

## Overview

This project follows a client-server architecture with:

- **Backend**: FastAPI framework (Python)
- **Frontend**: React with TypeScript

## Directory Structure

```
/
├── backend/             # FastAPI server application
│   ├── app/             # Main application code
│   │   ├── api/         # API endpoints
│   │   │   ├── deps.py  # Dependency injection
│   │   │   ├── main.py  # API router configuration
│   │   │   ├── routes/  # Route definitions
│   │   │   └── endpoints/ # Endpoint implementation
│   │   ├── core/        # Core functionality
│   │   ├── models.py    # Data models
│   │   ├── crud.py      # Database CRUD operations
│   │   └── main.py      # Application entry point
│   ├── alembic.ini      # Database migration configuration
│   └── pyproject.toml   # Python dependency management
│
├── frontend/            # React client application
│   ├── src/             # Source code
│   │   ├── components/  # Reusable UI components
│   │   │   └── ui/      # Base UI components
│   │   ├── routes/      # Application routes
│   │   └── ...
│   └── ...
│
├── docker-compose.yml   # Docker configuration
└── ...
```

## Backend Architecture

### FastAPI Application

The backend is built with FastAPI, providing a modern, fast API with automatic OpenAPI documentation.

#### Key Components:

1. **API Routes** (`backend/app/api/routes/`):

   - `utils.py`: Utility endpoints (health check, test email, streaming)
   - `users.py`: User management
   - `login.py`: Authentication
   - `feeds.py`: Content feeds
   - `items.py`: Item management

2. **Models** (`backend/app/models.py`):

   - Data models using SQLModel (combines SQLAlchemy and Pydantic)
   - Defines database schema and API request/response models

3. **Dependencies** (`backend/app/api/deps.py`):

   - Authentication dependencies
   - Database session management

4. **Configuration** (`backend/app/core/config.py`):
   - Environment-specific settings
   - Security configuration

### Database

- Uses PostgreSQL (configured in docker-compose.yml)
- Migrations managed by Alembic

## Frontend Architecture

### React Application

The frontend is built with React and TypeScript, using modern React patterns.

#### Key Components:

1. **Routes** (`frontend/src/routes/`):

   - Implements page routing using Tanstack Router
   - Each route has its own component and logic

2. **UI Components** (`frontend/src/components/ui/`):

   - Base UI components built on Chakra UI
   - All new components are to be built with tailwind exclusively.
   - Includes Dialog, Button, and other reusable elements
