from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services import user as user_service
from app.schemas.user import UserCreate
from app.models.user import UserRole, User
from app.models.event import Event, event_skills
from app.models.skill import UserSkill
from app.models.reliability import Participation, ParticipationStatus, Feedback
from app.models.portfolio import Portfolio, Media
from app.models.document import Document, DocumentType, DocumentStatus
from geoalchemy2.elements import WKTElement
from datetime import datetime, timedelta
import random

def seed_db():
    db = SessionLocal()
    
    # 1. Create Organizations
    orgs_data = [
        ("Green Earth", "org1@greenearth.org", "Community environmental group"),
        ("Help Hands", "org2@helphands.org", "Food bank and shelter"),
        ("Tech For All", "org3@techforall.org", "Digital literacy NGO")
    ]
    
    org_users = []
    for name, email, _ in orgs_data:
        user = user_service.get_by_email(db, email=email)
        if not user:
            user = user_service.create(db, obj_in=UserCreate(
                email=email,
                password="password123",
                full_name=name,
                role=UserRole.ORGANIZATION
            ))
        org_users.append(user)

    # 2. Create Volunteers
    volunteers_data = [
        ("Alice Smith", "alice@gmail.com", ["Teaching", "First Aid"], 95, 500),
        ("Bob Johnson", "bob@gmail.com", ["Construction", "Driving"], 88, 200),
        ("Charlie Davis", "charlie@gmail.com", ["Coding", "Graphic Design"], 92, 450),
        ("Diana Prince", "diana@gmail.com", ["Medical", "Translation"], 100, 1000),
        ("Evan Wright", "evan@gmail.com", ["Gardening", "Cooking"], 75, 100)
    ]
    
    vol_users = []
    for name, email, skills, score, pts in volunteers_data:
        user = user_service.get_by_email(db, email=email)
        if not user:
            user = User(
                email=email,
                hashed_password=user_service.get_password_hash("password123"),
                full_name=name,
                role=UserRole.VOLUNTEER,
                reliability_score=score,
                points=pts,
                is_verified=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Add Skills
            for s in skills:
                db.add(UserSkill(user_id=user.id, skill=s))
            
            # Add Portfolio
            portfolio = Portfolio(user_id=user.id, bio=f"I love helping with {skills[0]}!")
            db.add(portfolio)
            db.commit()
            db.refresh(portfolio)
            
            # Add Media
            db.add(Media(
                portfolio_id=portfolio.id,
                url="https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
                public_id="sample",
                media_type="image",
                caption="Helping out at the last event!"
            ))
            
            # Add Document
            db.add(Document(
                user_id=user.id,
                type=DocumentType.IDENTITY,
                status=DocumentStatus.APPROVED,
                url="https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
                public_id="doc_sample"
            ))
        vol_users.append(user)
    db.commit()

    # 3. Create Events
    events_data = [
        ("Park Cleanup", "Help us clean Central Park", org_users[0].id, [40.7850, -73.9682], ["Gardening"], 1),
        ("Food Distribution", "Distribute meals to those in need", org_users[1].id, [40.7128, -74.0060], ["Cooking", "Driving"], -1),
        ("Senior Tech Workshop", "Teach seniors how to use smartphones", org_users[2].id, [40.7580, -73.9855], ["Teaching", "Coding"], 2),
        ("Beach Clean-up Day", "Join us for a day at the beach", org_users[0].id, [34.0195, -118.4912], ["Gardening"], 5)
    ]
    
    events = []
    for title, desc, org_id, loc, skills, day_offset in events_data:
        # Check if event already exists
        existing = db.query(Event).filter(Event.title == title).first()
        if not existing:
            start = datetime.now() + timedelta(days=day_offset)
            end = start + timedelta(hours=4)
            point = f"POINT({loc[1]} {loc[0]})"
            
            event = Event(
                title=title,
                description=desc,
                organization_id=org_id,
                location=WKTElement(point, srid=4326),
                start_time=start,
                end_time=end
            )
            db.add(event)
            db.commit()
            db.refresh(event)
            
            for s in skills:
                db.execute(event_skills.insert().values(event_id=event.id, skill=s))
            events.append(event)
        else:
            events.append(existing)
    db.commit()

    # 4. Create Participations & Feedback
    for vol in vol_users[:3]: # First 3 volunteers join first event
        existing = db.query(Participation).filter(
            Participation.user_id == vol.id, 
            Participation.event_id == events[0].id
        ).first()
        if not existing:
            p = Participation(
                user_id=vol.id,
                event_id=events[0].id,
                status=ParticipationStatus.JOINED
            )
            db.add(p)
    
    # One completed participation with feedback
    completed_vol = vol_users[3] # Diana
    existing_p = db.query(Participation).filter(
        Participation.user_id == completed_vol.id,
        Participation.event_id == events[1].id
    ).first()
    if not existing_p:
        p = Participation(
            user_id=completed_vol.id,
            event_id=events[1].id,
            status=ParticipationStatus.COMPLETED
        )
        db.add(p)
        db.commit()
        db.refresh(p)
        
        db.add(Feedback(
            participation_id=p.id,
            rating=5,
            comment="Diana was amazing and very helpful!"
        ))
    
    db.commit()
    print("Database seeded successfully with fake data!")
    db.close()

if __name__ == "__main__":
    seed_db()
