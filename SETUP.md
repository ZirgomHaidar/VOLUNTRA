# Voluntra Setup Guide

This guide will help you get the Voluntra project up and running on your local machine.

## Prerequisites

Ensure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 20+](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

---

## 1. Infrastructure (Database & Redis)

Voluntra uses PostgreSQL with PostGIS and Redis. The easiest way to run these is via Docker.

```bash
docker-compose up -d
```

This will start:
- **PostgreSQL/PostGIS:** Available at `localhost:5432`
- **Redis:** Available at `localhost:6379`

---

## 2. Backend Setup (FastAPI)

### Create a Virtual Environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Environment Variables
Create a `backend/.env` file:
```env
DATABASE_URL=postgresql://voluntra:voluntrapassword@localhost:5432/voluntra_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your_super_secret_key_here
CLOUDINARY_URL=your_cloudinary_url_here  # Optional for initial setup
```

### Database Migrations
Run Alembic migrations to set up the database schema:
```bash
alembic upgrade head
```

### Run the Backend
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`. You can access the Swagger UI at `http://localhost:8000/docs`.

---

## 3. Frontend Setup (React + Vite)

### Install Dependencies
```bash
cd ../frontend
npm install
```

### Environment Variables
Create a `frontend/.env` file:
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=http://localhost:8000
```

### Run the Frontend
```bash
npm run dev
```
The frontend will be available at `http://localhost:5173`.

---

## 4. Troubleshooting

### Database Connection Issues
Ensure the Docker containers are running:
```bash
docker ps
```
If you need to reset the database:
```bash
docker-compose down -v
docker-compose up -d
alembic upgrade head
```

### Missing Dependencies
If you encounter missing module errors, ensure your virtual environment is active (for backend) and you have run `npm install` (for frontend).

---

## 5. Development Workflow

- **Backend:** Code is located in `backend/app`. FastAPI automatically reloads when changes are detected.
- **Frontend:** Code is located in `frontend/src`. Vite provides fast Hot Module Replacement (HMR).
- **Socket.io:** Real-time features are handled via the `SocketContext` in the frontend and `socket_manager.py` in the backend.
