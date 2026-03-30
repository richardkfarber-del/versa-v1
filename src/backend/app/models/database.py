from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum, JSON
import enum
from datetime import datetime
from app.database import Base

class PairingStatus(enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    DISCONNECTED = "disconnected"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    clerk_id = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=True) # Added for custom auth
    public_key = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Pairing(Base):
    __tablename__ = "pairings"
    id = Column(Integer, primary_key=True, index=True)
    user_a_id = Column(Integer, ForeignKey("users.id"))
    user_b_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    invite_code = Column(String, unique=True, index=True)
    status = Column(Enum(PairingStatus), default=PairingStatus.PENDING)
    shared_secret_salt = Column(String, nullable=True) 
    created_at = Column(DateTime, default=datetime.utcnow)

class EncryptedQuizAnswer(Base):
    __tablename__ = "quiz_answers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    pairing_id = Column(Integer, ForeignKey("pairings.id"))
    blind_hash = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ScheduledDate(Base):
    __tablename__ = "scheduled_dates"
    id = Column(Integer, primary_key=True, index=True)
    pairing_id = Column(Integer, ForeignKey("pairings.id"))
    content_id = Column(String)
    scheduled_for = Column(DateTime)
    reminder_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class CompassQuestion(Base):
    """
    MVP Admin Flow: Connection Compass Matrix
    """
    __tablename__ = "compass_questions"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    category = Column(String) # Brakes, Accelerators, Attachment, Boundaries
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DateNightItinerary(Base):
    """
    MVP Admin Flow: Content Management & Publishing
    """
    __tablename__ = "date_nights"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    instructions = Column(JSON) # Step-by-step logic
    energy_level = Column(String)
    focus = Column(String)
    is_premium = Column(Boolean, default=True)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
