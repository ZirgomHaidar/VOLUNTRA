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
    # Fetch event skills directly from association table
    event_skill_names = {row.skill for row in db.query(event_skills).filter(event_skills.c.event_id == event.id).all()}
    
    if event_skill_names:
        matches = user_skills.intersection(event_skill_names)
        match_ratio = len(matches) / len(event_skill_names)
        score += (match_ratio * 40)
        if matches:
            reasons.append(f"Matches skills: {', '.join(matches)}")

    # 2. Location Proximity (15%)
    # Max proximity points if distance < 5km, scales down to 0 at 50km
    if distance_km < 5:
        score += 15
        reasons.append("Very close to your location")
    elif distance_km < 50:
        score += (15 * (1 - (distance_km / 50)))
        reasons.append(f"Within {round(distance_km, 1)}km")

    # 3. Reliability & Experience (Placeholder logic for 25%)
    # In a real app, this would query history/reliability services
    score += 15 # Base participation points
    
    return round(score, 2), reasons

def get_matches_for_user(
    db: Session, 
    user: User, 
    lat: float, 
    lon: float, 
    limit: int = 10
) -> List[MatchResult]:
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
