# Frontend Workspace

This folder contains the React/Vite client for Client Project Tracker.

## Responsibilities

- authenticate against the backend API
- show the main project and task workflow
- surface loading, empty, and error states clearly
- trigger server-side AI task generation from the dashboard

## Internal Structure

- `src/pages`: route-level screens
- `src/components`: dashboard and shared UI components
- `src/hooks`: dashboard data orchestration
- `src/api`: Axios client and API functions
- `src/types`: frontend contracts
- `src/utils`: auth token and API error helpers

## Local Commands

```bash
npm run dev
npm run lint
npm run build
```

Create `frontend/.env` from `frontend/.env.example` if you need to point the client at a different backend URL.

The root `README.md` contains the full setup flow for the project.
