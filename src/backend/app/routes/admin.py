from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import DateNightItinerary, CompassQuestion, User
from typing import List
from pydantic import BaseModel

class PaywallUpdate(BaseModel):
    is_premium: bool

class CompassQuestionCreate(BaseModel):
    text: str
    category: str

# Mocking a get_db and admin_required dependency
from app.database import get_db
def admin_required(): pass

router = APIRouter(prefix="/api/v1/admin", tags=["Admin Portal"])

@router.post("/content/publish")
async def publish_itinerary(data: dict, db: Session = Depends(get_db)):
    """
    User Story: Date Night Creation and Publishing
    """
    new_itinerary = DateNightItinerary(**data)
    db.add(new_itinerary)
    db.commit()
    return {"status": "published", "id": new_itinerary.id}

@router.patch("/content/{itinerary_id}/paywall")
async def toggle_paywall(itinerary_id: int, payload: PaywallUpdate, db: Session = Depends(get_db)):
    """
    User Story: Premium Content Paywall Toggling
    """
    item = db.query(DateNightItinerary).filter(DateNightItinerary.id == itinerary_id).first()
    if not item: raise HTTPException(status_code=404)
    item.is_premium = payload.is_premium
    db.commit()
    return {"status": "updated", "is_premium": item.is_premium}

@router.post("/compass/question")
async def add_compass_question(payload: CompassQuestionCreate, db: Session = Depends(get_db)):
    """
    User Story: Connection Compass Question Management
    """
    q = CompassQuestion(text=payload.text, category=payload.category)
    db.add(q)
    db.commit()
    return {"status": "question_added", "id": q.id}

@router.get("/users/search")
async def search_users(email: str, db: Session = Depends(get_db)):
    """
    User Story: Basic User & Subscription Moderation
    Ensures PII and sensitive quiz answers are NOT exposed.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    return {
        "email": user.email,
        "clerk_id": user.clerk_id,
        "created_at": user.created_at
    }
