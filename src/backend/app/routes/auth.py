from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
import logging

from app.database import get_db
from app.models.database import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.utils.security import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, REMEMBER_ME_EXPIRE_DAYS

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user with an email and password.
    """
    db_user = db.query(User).filter(User.email == user.email.lower()).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    
    # clerk_id can be None here since we are using custom auth
    new_user = User(
        email=user.email.lower(),
        password_hash=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return a JWT token.
    Implements generic error for security against enumeration.
    """
    db_user = db.query(User).filter(User.email == user_data.email.lower()).first()
    
    # Generic error message so we don't leak whether the email exists
    generic_auth_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not db_user or not db_user.password_hash:
        raise generic_auth_error
        
    if not verify_password(user_data.password, db_user.password_hash):
        raise generic_auth_error
    
    # Handle "Remember Me" persistent token duration
    if user_data.remember_me:
        access_token_expires = timedelta(days=REMEMBER_ME_EXPIRE_DAYS)
    else:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
