# Movie Recommendation System

Movie recommendation demo app backed by Neo4j. The project includes a simple Express API and static frontend pages for user management, movies, relationships, and recommendations.

## Features

- Login and signup flow
- Default admin account for quick access
- Manage users, movies, and WATCHED / LIKED relationships
- Recommendation page based on stored graph data
- Sample-data endpoints for demo setup

## Tech Stack

- Node.js
- Express
- Neo4j
- Vanilla HTML, CSS, and JavaScript

## Project Structure

```text
.
|-- server.js
|-- index.html
|-- login.html
|-- signup.html
|-- users.html
|-- movies.html
|-- recommend.html
|-- admin.html
|-- css/
|-- js/
`-- .env.example
```

## Prerequisites

- Node.js 18+ recommended
- A running Neo4j instance

## Environment Variables

Copy `.env.example` to `.env` and adjust values if needed.

```env
PORT=4000
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=12345678
NEO4J_DATABASE=neo4j
DEFAULT_ADMIN_PASSWORD=admin123
```

Notes:

- The server listens on `http://localhost:4000` by default.
- Frontend API calls point to `http://localhost:4000/api`.
- If `DEFAULT_ADMIN_PASSWORD` is not set, the app falls back to `admin123`.

## Installation

```bash
npm install
```

## Run

```bash
npm start
```

After the server starts, open:

- `http://localhost:4000/login.html`

## Default Login

- Username: `admin`
- Password: `admin123`

If you changed `DEFAULT_ADMIN_PASSWORD` in `.env`, use that password instead.

## Main Pages

- `login.html`: sign in
- `signup.html`: create a user account
- `index.html`: main landing page after login
- `users.html`: manage users
- `movies.html`: manage movies and relationships
- `recommend.html`: view recommendations
- `admin.html`: combined admin view for all major entities

## Useful API Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users`
- `POST /api/users/sample`
- `GET /api/movies`
- `POST /api/movies/sample`
- `GET /api/relationships`
- `POST /api/relationships/sample`

## Demo Setup

If you want quick sample data for a demo, use the buttons in the UI or call the sample endpoints:

- `POST /api/users/sample`
- `POST /api/movies/sample`
- `POST /api/relationships/sample`

## Troubleshooting

### Login shows `Failed to fetch`

Usually means the frontend cannot reach the backend.

Check:

1. `npm start` is running
2. Neo4j is running on the configured `NEO4J_URI`
3. `http://localhost:4000/api/health` responds successfully

### Server starts but data actions fail

Usually means Neo4j credentials or database settings in `.env` are incorrect.

## Docker

This project is ready to run with Docker using the repo contents only:

- application code
- `Dockerfile`
- `docker-compose.yml`
- `.env`

### First Machine: build and run

1. Copy `.env.example` to `.env`
2. Start the stack:

```bash
docker compose up -d --build
```

This starts:

- `app` on `http://localhost:4000`
- `neo4j` on `http://localhost:7474` and `bolt://localhost:7687`

### Push the app image to a registry

Set the image name in `.env` before building, for example:

```env
APP_IMAGE=your-dockerhub-user/movie-recommendation-system:latest
```

Then build and push:

```bash
docker compose build app
docker compose push app
```

### Move to another machine

Copy these files to the other machine:

- project source code
- `Dockerfile`
- `docker-compose.yml`
- `.env`

Then pull and start:

```bash
docker compose pull app
docker compose up -d
```

If you want the other machine to build locally instead of pulling from a registry:

```bash
docker compose up -d --build
```

### Data notes

- Neo4j data is stored in the named Docker volume `neo4j_data`
- Neo4j logs are stored in the named Docker volume `neo4j_logs`
- If you do not need to keep local data, you can reset everything with `docker compose down -v`

If you want to migrate existing Neo4j data between machines, export the database first or copy the Docker volume contents before bringing the stack up on the new machine.

## License

MIT
