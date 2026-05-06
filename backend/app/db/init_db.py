from app.db.session import SessionLocal
from app.services import user as user_service
from app.schemas.user import UserCreate
from app.models.user import UserRole
import sys

def init_db():
    db = SessionLocal()
    email = "admin@voluntra.com"
    password = "admin123"
    
    user = user_service.get_by_email(db, email=email)
    if not user:
        admin_in = UserCreate(
            email=email,
            password=password,
            full_name="System Admin",
            role=UserRole.ADMIN
        )
        user_service.create(db, obj_in=admin_in)
        print(f"Admin user created successfully!")
        print(f"Email: {email}")
        print(f"Password: {password}")
    else:
        print(f"Admin user already exists.")

if __name__ == "__main__":
    init_db()
