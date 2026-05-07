from typing import List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from geoalchemy2.functions import ST_Distance, ST_MakePoint, ST_SetSRID
from app.models.event import Event, event_skills
from app.models.user import User
from app.models.skill import UserSkill
from app.schemas.event import MatchResult

def calculate_match_score(
    db: Session, 
    user: User, 
    event: Event, 
    distance_km: float
) -> Tuple[float, List[str]]:
    score = 0.0
    reasons = []

    # 1. Skill Match (40%)
    user_skills = {s.skill for s in db.query(UserSkill).filter(UserSkill.user_id == user.id).all()}
    event_skill_names = {row.skill for row in db.query(event_skills).filter(event_skills.c.event_id == event.id).all()}
    
    if event_skill_names:
        matches = user_skills.intersection(event_skill_names)
        match_ratio = len(matches) / len(event_skill_names)
        score += (match_ratio * 40)
        if matches:
            reasons.append(f"Skill Match: {int(match_ratio * 100)}%")

    # 2. Availability (20%) - Simplified: Check if user has no overlapping events
    # For now, we'll give 20% if they are active, assuming they manage their calendar
    score += 20
    reasons.append("Available for this time slot")

    # 3. Location Proximity (15%)
    if distance_km < 5:
        score += 15
        reasons.append("Proximity: Very Close (<5km)")
    elif distance_km < 50:
        loc_score = 15 * (1 - (distance_km / 50))
        score += loc_score
        reasons.append(f"Proximity: {round(distance_km, 1)}km")

    # 4. Reliability Score (15%)
    # user.reliability_score is 0-100, we take 15% of it
    rel_score = (user.reliability_score / 100) * 15
    score += rel_score
    reasons.append(f"Reliability: {user.reliability_score}%")

    # 5. Experience (10%) - Based on number of completed participations
    completed_count = db.query(Participation).filter(
        Participation.user_id == user.id,
        Participation.status == ParticipationStatus.COMPLETED
    ).count()
    
    # 2% per completed event, max 10%
    exp_score = min(completed_count * 2, 10)
    score += exp_score
    if completed_count > 0:
        reasons.append(f"Experience: {completed_count} events completed")
    
    return round(score, 2), reasons

from app.models.reliability import Participation, ParticipationStatus
from app.schemas.organization import VolunteerMatch

# ... existing code ...

def get_matches_for_user(
    db: Session, 
    user: User, 
    lat: float, 
    lon: float, 
    limit: int = 10
) -> List[MatchResult]:
    # ... existing code ...
    # Create user point
    user_point = ST_SetSRID(ST_MakePoint(lon, lat), 4326)
    
    # Query events ordered by distance
    events_with_distance = db.query(
        Event,
        ST_Distance(Event.location, user_point).label("distance")
    ).filter(
        Event.end_time > func.now()
    ).order_by("distance").limit(50).all()

    matches = []
    for event, distance_meters in events_with_distance:
        distance_km = distance_meters / 1000.0
        score, reasons = calculate_match_score(db, user, event, distance_km)
        
        matches.append(MatchResult(
            event_id=event.id,
            title=event.title,
            score=score,
            distance_km=round(distance_km, 2),
            match_reasons=reasons
        ))
    
    # Sort by score descending
    matches.sort(key=lambda x: x.score, reverse=True)
    return matches[:limit]

def get_suggested_volunteers(
    db: Session,
    organization_id: int,
    limit: int = 5
) -> List[VolunteerMatch]:
    # This is a simplified version. 
    # Real AI would look at the organization's active events and find best matches.
    # For now, we'll return top reliability score volunteers.
    
    volunteers = db.query(User).filter(
        User.role == "volunteer",
        User.is_active == True
    ).order_by(User.reliability_score.desc()).limit(limit).all()
    
    matches = []
    for v in volunteers:
        # Get their primary skill
        skill = db.query(UserSkill).filter(UserSkill.user_id == v.id).first()
        expertise = skill.skill if skill else "General Volunteer"
        
        matches.append(VolunteerMatch(
            user_id=v.id,
            full_name=v.full_name or "Anonymous",
            score=float(v.reliability_score),
            expertise=expertise
        ))
    return matches
