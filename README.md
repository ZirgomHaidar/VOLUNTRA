# Voluntra: AI-Powered Volunteer Management

Voluntra is a centralized, intelligent platform designed to connect passionate volunteers with social service organizations. By leveraging AI-driven matching, real-time coordination, and a robust trust system, Voluntra ensures that the right skills reach the right causes at the right time.

## 🌟 Key Features

*   **Intelligent Matching**: Bidirectional scoring system based on skills, location (PostGIS), reliability, and experience.
*   **Trust & Reliability**: Dynamic "Trust Scores" and "Points" system to reward consistent and high-quality volunteering.
*   **Organization Hub**: Full-featured dashboard for organizations to manage events, invite suggested volunteers, and track participation.
*   **Volunteer Portfolios**: Public-facing profiles showcasing verified skills, impact history, and media galleries.
*   **Real-time Coordination**: Live notifications and event updates powered by Socket.io.
*   **Secure Verification**: Admin-led document approval workflow for identity and certificate verification.

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.14 compatible)
- **Database**: PostgreSQL with PostGIS (Spatial queries)
- **Migrations**: Alembic
- **Real-time**: Python-Socketio
- **Async Tasks**: Celery & Redis
- **Security**: JWT & Bcrypt

### Frontend
- **Framework**: React 19 & TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

## 🚀 Quick Start

1.  **Infrastructure**: `docker-compose up -d` (Starts PostGIS & Redis).
2.  **Backend**:
    ```bash
    cd backend
    python -m venv venv && source venv/bin/activate
    export PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1
    pip install -r requirements.txt
    alembic upgrade head
    uvicorn app.main:app --reload
    ```
3.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

For detailed setup instructions, including environment variables and demo data, please refer to [SETUP.md](./SETUP.md).

---
*Built with passion for social impact.*
