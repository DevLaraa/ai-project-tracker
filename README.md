# Client Project Tracker API (Express + TypeScript + PostgreSQL)

## Prerequisites

- Node.js 18+
- PostgreSQL

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Create the schema:
   - Option A (manual): run `sql/init.sql`
   - Option B (Docker below): see `docker-compose.yml`

## Run

- Development: `npm run dev`
- Build: `npm run build`
- Start (prod build): `npm start`
- Frontend: from `frontend/`, copy `.env.example` to `.env` and set `VITE_API_URL` if needed

## Endpoints

- `GET /health`
- `POST /auth/login` (JSON body: `{ "email": "...", "password": "..." }`)
- `GET /users?limit=25&offset=0` (requires `Authorization: Bearer <token>`)
- `GET /users/:id` (UUID, requires token)
- `POST /users` (JSON body: `{ "email": "...", "name": "...", "password": "..." }`, requires token)
- `GET /projects` (requires token)
- `GET /projects/:id` (requires token)
- `POST /projects` (JSON body: `{ "name": "...", "description": "..." }`, requires token)
- `PATCH /projects/:id` (requires token)
- `DELETE /projects/:id` (requires token)
- `GET /tasks?projectId=<uuid>` (optional `projectId`, requires token)
- `GET /tasks/:id` (requires token)
- `POST /tasks` (JSON body: `{ "projectId": "...", "title": "...", "status": "todo|in_progress|done", "assignedUserId": "...", "dueDate": "ISO-8601" }`, requires token)
- `PATCH /tasks/:id` (partial update, requires token)
- `DELETE /tasks/:id` (requires token)
- `POST /ai/generate-tasks` (requires token; uses external OpenAI-compatible API when `AI_API_KEY` is set, otherwise returns mock tasks)
- `POST /ai/generate-and-create-tasks` (requires token; generates tasks and persists them atomically for a project)

