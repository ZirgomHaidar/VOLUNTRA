from sqlalchemy.orm import Session
from app.models.user import User
from app.models.reliability import Participation, ParticipationStatus, Feedback

def update_user_reliability(db: Session, user_id: int):
    """
    Recalculate reliability score (0-100) based on:
    - Completion rate (60%)
    - Average rating (40%)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return

    participations = db.query(Participation).filter(Participation.user_id == user_id).all()
    if not participations:
        user.reliability_score = 100
        db.commit()
        return

    # 1. Completion Rate
    completed = [p for p in participations if p.status == ParticipationStatus.COMPLETED]
    no_shows = [p for p in participations if p.status == ParticipationStatus.NO_SHOW]
    
    # Penalize no-shows more than simple non-completion
    total_relevant = len(completed) + len(no_shows)
    completion_score = (len(completed) / total_relevant * 100) if total_relevant > 0 else 100

    # 2. Average Rating
    feedbacks = db.query(Feedback).join(Participation).filter(Participation.user_id == user_id).all()
    if feedbacks:
        avg_rating = sum(f.rating for f in feedbacks) / len(feedbacks)
        rating_score = (avg_rating / 5) * 100
    else:
        rating_score = 100 # Default to perfect if no feedback yet

    # Weighted Average
    final_score = (completion_score * 0.6) + (rating_score * 0.4)
    user.reliability_score = int(final_score)
    db.commit()

def award_points(db: Session, user_id: int, points: int):
    """
    Add points to user profile.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.points += points
        db.commit()
        db.refresh(user)
    return user
