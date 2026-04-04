# AI Project Tracker

A full-stack project and task management application built with a TypeScript/Express/PostgreSQL backend and a React/Vite/Tailwind frontend.

## Overview

AI Project Tracker is a portfolio-focused full-stack app that lets authenticated users:

- create and manage projects
- create, update, and delete tasks
- track task status
- generate project tasks with AI assistance

The project was intentionally structured to reflect real software engineering concerns beyond basic CRUD, including layered backend architecture, validation at the API boundary, ownership enforcement, centralized error handling, and server-side AI orchestration.

## Features

- JWT authentication
- Password hashing with bcrypt
- Protected backend routes
- Project CRUD
- Task CRUD
- Task status updates
- Ownership checks for projects and tasks
- AI-assisted task generation and persistence
- Axios API layer with request/response interceptors
- Centralized backend error handling
- Request validation with Zod
- PostgreSQL relational data model
- Local Docker support for PostgreSQL

## Tech Stack

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- Zod
- bcrypt
- JSON Web Tokens
- pino / pino-http

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Axios
- React Router

## Architecture

### Backend

The backend follows a layered architecture:

- **Controllers** handle HTTP concerns such as parsing, validation, and responses.
- **Services** contain business rules such as ownership checks and AI orchestration.
- **Repositories** encapsulate SQL queries and database access.

This keeps request handling, business logic, and persistence clearly separated and easier to maintain.

### Frontend

The frontend is organized around:

- **pages** for route-level UI
- **API modules** for backend communication
- **routing** for navigation and route protection
- **local state** for dashboard workflows

Axios is configured centrally so auth tokens are injected automatically and expired sessions are handled consistently.

### Database

Main entities:

- `users`
- `projects`
- `tasks`

Relationships:

- a project belongs to a user
- a task belongs to a project

This model supports ownership checks both in service logic and in SQL queries.

## Authentication

- Users register and log in with email and password
- Passwords are hashed with bcrypt
- The backend returns a JWT after successful auth
- Protected routes validate the token and attach the user to the request
- The frontend stores the token locally and sends it through axios interceptors

## AI Integration

The app includes AI-assisted task generation.

Flow:

1. The frontend requests task generation for a selected project
2. The backend builds the prompt
3. The backend calls the configured AI provider or uses a mock fallback
4. The backend validates the returned structure
5. Generated tasks are persisted transactionally in the selected project

This keeps provider logic, validation, and persistence on the server side.

## API Summary

### Health

- `GET /health`

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Users

- `GET /users?limit=25&offset=0`
- `GET /users/:id`
- `POST /users`

### Projects

- `GET /projects`
- `GET /projects/:id`
- `POST /projects`
- `PATCH /projects/:id`
- `DELETE /projects/:id`

### Tasks

- `GET /tasks?projectId=<uuid>`
- `GET /tasks/:id`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

### AI

- `POST /ai/generate-tasks`
- `POST /ai/generate-and-create-tasks`

All routes except `/health`, `/auth/register`, and `/auth/login` require a bearer token.

## Local Setup

### 1. Backend

```bash
npm install
cp .env.example .env
npm run dev
```

Create the database schema with one of these options:

- run `sql/init.sql` manually
- use Docker Compose and point `DATABASE_URL` to the running Postgres instance

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

By default, the frontend expects the API at `http://localhost:3000`.

### 3. Docker Postgres

```bash
docker compose up -d
```

The included Docker setup exposes PostgreSQL on port `5433`.

## Environment Variables

### Backend

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `BCRYPT_SALT_ROUNDS`
- `AI_API_BASE_URL`
- `AI_MODEL`
- `AI_API_KEY`
- `CORS_ORIGIN`
- `DEFAULT_PAGE_LIMIT`
- `MAX_PAGE_LIMIT`

### Frontend

- `VITE_API_URL`

## Engineering Decisions

- **Layered architecture** to separate HTTP, business logic, and persistence
- **Zod validation** to enforce runtime validation at the API boundary
- **JWT auth** for a simple stateless SPA-friendly auth flow
- **Axios interceptors** to centralize token handling and `401` behavior
- **Server-side AI integration** to keep prompts, provider calls, and persistence controlled
- **Ownership checks** to ensure users only access their own projects and tasks
- **Transactional AI task creation** to avoid partial writes when creating generated tasks

## What I’d Improve Next

- Add automated tests for auth, ownership, and AI-assisted flows
- Further modularize the dashboard UI as the frontend grows
- Tighten authorization around future user-management flows
- Add shared contracts or stronger end-to-end typing between frontend and backend
- Add more production-oriented observability and monitoring

## Portfolio Notes

This project is meant to demonstrate:

- full-stack React + TypeScript development
- REST API design
- PostgreSQL-backed application design
- modular backend architecture
- practical AI integration
- maintainable and interview-defensible code structure
