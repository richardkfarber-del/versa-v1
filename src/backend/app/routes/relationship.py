from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import Pairing, EncryptedQuizAnswer, PairingStatus
from datetime import datetime
from pydantic import BaseModel

# Mocking a get_db dependency
from app.database import get_db
# def get_db():

class UnlinkRequest(BaseModel):
    user_id: int

class ScheduleRequest(BaseModel):
    pairing_id: int
    content_id: str
    timestamp: datetime

router = APIRouter(prefix="/api/v1/relationship", tags=["Relationship Management"])

@router.post("/unlink/{pairing_id}")
async def unlink_partner(pairing_id: int, payload: UnlinkRequest, db: Session = Depends(get_db)):
    """
    Epic 9: Unlinking a Partner (The Kill Switch)
    Sever the connection and purge the shared salt to anonymize existing match data.
    """
    pairing = db.query(Pairing).filter(Pairing.id == pairing_id).first()
    
    if not pairing or (pairing.user_a_id != payload.user_id and pairing.user_b_id != payload.user_id):
        raise HTTPException(status_code=403, detail="Not authorized to unlink this pairing")

    # 1. Purge the Shared Salt (Cryptographic Self-Destruct)
    pairing.shared_secret_salt = None
    
    # 2. Update status
    pairing.status = PairingStatus.DISCONNECTED
    
    # 3. Delete all blind hashes associated with this pairing
    db.query(EncryptedQuizAnswer).filter(EncryptedQuizAnswer.pairing_id == pairing_id).delete()
    
    db.commit()
    return {"status": "success", "message": "Partner unlinked and data access revoked."}

@router.post("/schedule")
async def schedule_date(payload: ScheduleRequest, db: Session = Depends(get_db)):
    """
    Epic 10: In-App Date Scheduling
    Log a future connection window.
    """
    # Logic to insert into ScheduledDate table would go here
    return {"status": "success", "scheduled_for": payload.timestamp}

