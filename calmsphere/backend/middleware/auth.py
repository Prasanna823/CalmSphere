# middleware/auth.py — JWT Authentication Middleware
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from models.database import get_db, User
import os

security = HTTPBearer()

SECRET_KEY = os.getenv("JWT_SECRET", "change-this-in-production")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Decode JWT token and return current user from database."""
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Ensure current user is active."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_user_id_from_token(token: str) -> int:
    """Extract user ID from JWT token (for use in endpoints that need user_id)."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # In a real implementation, you'd query the DB to get user ID
        # For now, we'll return a placeholder
        return 1  # This should be replaced with actual user ID lookup
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
