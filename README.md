# AI Project Tracker

A full-stack project and task management application built with a TypeScript/Express/PostgreSQL backend and a React/Vite/Tailwind frontend.

## Overview

AI Project Tracker is a project management app that allows authenticated users to create projects, manage tasks, update task status, and generate project tasks with AI assistance.

The goal of this project was not only to build a working full-stack product, but also to structure it in a way that reflects real software engineering practices such as layered architecture, validation at the API boundary, ownership checks, clean separation of concerns, and server-side AI orchestration.

## Features

- User authentication with JWT
- Password hashing with bcrypt
- Protected backend routes
- Project CRUD flows
- Task CRUD flows
- Task status management
- Ownership checks so users only access their own data
- AI-assisted task generation
- Frontend API layer using axios
- Automatic JWT injection using axios interceptors
- Centralized backend error handling
- Request validation with Zod
- PostgreSQL relational data model

## Tech Stack

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- Zod
- bcrypt
- JWT

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

- **Controllers** handle HTTP concerns such as request parsing, validation, and responses.
- **Services** contain business logic such as ownership checks and AI task creation orchestration.
- **Repositories** encapsulate SQL queries and database access.

This separation keeps responsibilities explicit and improves maintainability and scalability.

### Frontend
The frontend separates:
- pages
- API calls
- routing
- local UI state

Axios is configured in a dedicated API layer with interceptors so authentication headers are injected automatically.

## Authentication

Authentication is implemented using JWT.

- Users register and log in with email and password
- Passwords are hashed with bcrypt
- The backend returns a JWT after successful authentication
- Protected routes validate the token
- The frontend stores the token and sends it automatically with axios

## Database Design

Main entities:
- `users`
- `projects`
- `tasks`

Relationships:
- a project belongs to a user
- a task belongs to a project

This model supports ownership enforcement both in the service layer and in SQL queries.

## AI Integration

The app includes AI-assisted task generation.

Flow:
1. The frontend requests task generation for a selected project
2. The backend builds the prompt
3. The backend calls the AI provider or a mock fallback
4. The backend validates the returned structure
5. Generated tasks are persisted in the selected project

This keeps the integration controlled, validated, and server-side.

## Why I Built This

I wanted to build a project that was:
- portfolio-ready
- interview-defensible
- architected beyond tutorial-level CRUD
- realistic enough to demonstrate backend structure, auth, data ownership, and AI integration

## Key Engineering Decisions

- **Layered architecture** to separate HTTP, business logic, and data access
- **Zod validation** to validate requests at runtime, not only through TypeScript
- **JWT auth** for a simple stateless SPA-friendly authentication model
- **Axios interceptors** to centralize token handling
- **Server-side AI integration** to keep provider logic, prompt construction, and persistence controlled on the backend
- **Ownership checks** to ensure users only access their own projects and tasks

## What I’d Improve Next

- Add automated tests for auth, ownership, and AI-assisted task generation flows
- Further modularize the frontend dashboard into smaller reusable components
- Add more production-oriented observability and monitoring
- Strengthen authorization around future user-management flows
- Add shared API contracts or end-to-end typing improvements

## Local Setup

### Backend
```bash
cd backend
npm install
npm run dev