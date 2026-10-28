# main.py — CalmSphere FastAPI Backend
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
import jwt, bcrypt, os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from models.database import get_db, init_db, User, ChatMessage, MoodLog, Session
from middleware.auth import get_current_active_user
import anthropic
from deep_translator import GoogleTranslator
from textblob import TextBlob
import httpx

load_dotenv()

app = FastAPI(title="CalmSphere API", version="1.0.0")

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("JWT_SECRET", "change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# ─── Pydantic Models ───────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserPreferences(BaseModel):
    language: str  # 'en' | 'hi' | 'te'
    mode: str      # 'text' | 'voice'

class ChatMessage(BaseModel):
    message: str
    language: str = "en"

class MoodEntry(BaseModel):
    emotion: str
    score: int
    note: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_name: str

# ─── Auth Helpers ──────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ─── Helper Functions ───────────────────────────────────────────────────────────

import re

def detect_emotion(text: str) -> str:
    """Simple regex-based emotion detection."""
    t = text.lower()
    
    # Anxiety patterns
    if re.search(r'anxious|anxiety|panic|worry|worried|nervous|restless|चिंत|ఆందోళన', t):
        return 'anxious'
    
    # Sadness patterns
    if re.search(r'sad|depressed|cry|hopeless|alone|lonely|unhappy|दुख|దిగులు', t):
        return 'sad'
    
    # Stress patterns
    if re.search(r'stress|overwhelm|pressure|tired|exhausted|burnout|तनाव|ఒత్తిడి', t):
        return 'stressed'
    
    # Calm patterns
    if re.search(r'calm|better|good|happy|grateful|peaceful|relaxed|ठीक|బాగుంది', t):
        return 'calm'
    
    return 'neutral'

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(user: UserRegister, db: Session = Depends(get_db)):
    """Register new user and return JWT token."""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = hash_password(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        language="en",
        mode="text"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Generate JWT token
    token = create_access_token({"sub": user.email, "name": user.name})
    return {
        "access_token": token, 
        "token_type": "bearer", 
        "user_name": user.name
    }

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(user: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    # Fetch user from DB
    db_user = db.query(User).filter(User.email == user.email).first()
    
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Generate JWT token
    token = create_access_token({"sub": user.email, "name": db_user.name})
    return {
        "access_token": token, 
        "token_type": "bearer", 
        "user_name": db_user.name
    }

@app.post("/api/preferences")
async def save_preferences(prefs: UserPreferences, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Save user language and mode preferences."""
    # Update user preferences
    current_user.language = prefs.language
    current_user.mode = prefs.mode
    db.commit()
    
    return {"status": "saved", "language": prefs.language, "mode": prefs.mode}

@app.post("/api/chat")
async def chat(msg: ChatMessage, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """
    Main chat endpoint.
    Flow: translate (if needed) → sentiment analysis → Claude response → translate back
    """
    try:
        # Step 1 — Translate to English if language != 'en'
        translated_text = msg.message
        if msg.language != 'en':
            try:
                translator = GoogleTranslator(source=msg.language, target='en')
                translated_text = translator.translate(msg.message)
            except Exception as e:
                print(f"Translation error: {e}")
                translated_text = msg.message  # Fallback to original
        
        # Step 2 — Sentiment analysis using TextBlob
        sentiment_score = 0
        try:
            blob = TextBlob(translated_text)
            sentiment_score = blob.sentiment.polarity  # -1.0 to 1.0
        except Exception as e:
            print(f"Sentiment analysis error: {e}")
        
        # Step 3 — Emotion detection (simple regex-based)
        emotion = detect_emotion(translated_text)
        
        # Step 4 — Call Anthropic Claude API
        claude_response = "I'm here to support you. Could you tell me more about how you're feeling?"
        try:
            client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
            
            # Build conversation history (simplified)
            system_prompt = f"""You are CalmSphere, a compassionate AI mental health companion. 
            Listen deeply, validate feelings, offer evidence-based suggestions (breathing, grounding, journaling). 
            If crisis detected, provide Indian helplines (iCall: 9152987821). 
            Keep responses 2-4 sentences, warm and human. Never diagnose. 
            User name: {current_user.name}. 
            Respond in {'English.' if msg.language == 'en' else 'Hindi using Devanagari script.' if msg.language == 'hi' else 'Telugu using Telugu script.'}"""
            
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1000,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": translated_text}
                ]
            )
            claude_response = response.content[0].text
            
            # Step 5 — Translate response back to user's language if needed
            if msg.language != 'en':
                try:
                    translator_back = GoogleTranslator(source='en', target=msg.language)
                    claude_response = translator_back.translate(claude_response)
                except Exception as e:
                    print(f"Translation back error: {e}")
                    # Keep English response if translation fails
        
        except Exception as e:
            print(f"Claude API error: {e}")
            claude_response = "I'm here with you. Could you tell me more?"
        
        # Step 6 — Save ChatMessage rows to DB
        user_message = ChatMessage(
            user_id=current_user.id,
            role="user",
            content=msg.message,
            language=msg.language,
            emotion=emotion,
            sentiment_score=sentiment_score,
            created_at=datetime.utcnow()
        )
        db.add(user_message)
        
        assistant_message = ChatMessage(
            user_id=current_user.id,
            role="assistant",
            content=claude_response,
            language=msg.language,
            created_at=datetime.utcnow()
        )
        db.add(assistant_message)
        
        # Step 7 — Log MoodLog entry
        mood_score = int((sentiment_score + 1) * 50)  # Convert -1 to 1 range to 0-100
        mood_entry = MoodLog(
            user_id=current_user.id,
            emotion=emotion,
            score=mood_score,
            note=msg.message,
            logged_at=datetime.utcnow()
        )
        db.add(mood_entry)
        
        # Step 8 — Update or create Session
        today = datetime.utcnow().date()
        existing_session = db.query(Session).filter(
            Session.user_id == current_user.id,
            Session.started_at >= today
        ).first()
        
        if existing_session:
            existing_session.message_count += 1
            existing_session.dominant_emotion = emotion
        else:
            new_session = Session(
                user_id=current_user.id,
                message_count=1,
                dominant_emotion=emotion,
                started_at=datetime.utcnow()
            )
            db.add(new_session)
        
        db.commit()
        
        return {
            "response": claude_response,
            "sentiment": sentiment_score,
            "emotion": emotion,
            "language": msg.language
        }
        
    except Exception as e:
        print(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/mood")
async def log_mood(entry: MoodEntry, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Log a mood entry to the database."""
    mood_entry = MoodLog(
        user_id=current_user.id,
        emotion=entry.emotion,
        score=entry.score,
        note=entry.note,
        logged_at=datetime.utcnow()
    )
    db.add(mood_entry)
    db.commit()
    
    return {"status": "logged", "emotion": entry.emotion, "score": entry.score}

@app.get("/api/mood/history")
async def get_mood_history(days: int = 7, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Fetch mood history for dashboard chart."""
    from datetime import date, timedelta
    
    start_date = date.today() - timedelta(days=days)
    
    mood_entries = db.query(MoodLog).filter(
        MoodLog.user_id == current_user.id,
        MoodLog.logged_at >= start_date
    ).order_by(MoodLog.logged_at.desc()).all()
    
    history = [
        {
            "date": entry.logged_at.strftime("%Y-%m-%d"),
            "score": entry.score,
            "emotion": entry.emotion,
            "note": entry.note
        }
        for entry in mood_entries
    ]
    
    return {"history": history}

@app.get("/api/dashboard")
async def get_dashboard(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Aggregate dashboard stats for current user."""
    from datetime import date, timedelta
    
    # Calculate streak (consecutive days with mood logs)
    streak = 0
    current_date = date.today()
    
    while True:
        day_entries = db.query(MoodLog).filter(
            MoodLog.user_id == current_user.id,
            MoodLog.logged_at >= current_date,
            MoodLog.logged_at < current_date + timedelta(days=1)
        ).first()
        
        if day_entries:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            break
    
    # Count sessions
    sessions = db.query(Session).filter(Session.user_id == current_user.id).count()
    
    # Calculate average mood score (last 30 days)
    thirty_days_ago = date.today() - timedelta(days=30)
    recent_moods = db.query(MoodLog).filter(
        MoodLog.user_id == current_user.id,
        MoodLog.logged_at >= thirty_days_ago
    ).all()
    
    avg_mood_score = 0
    if recent_moods:
        avg_mood_score = sum(mood.score for mood in recent_moods) // len(recent_moods)
    
    # Get weekly data (last 7 days)
    weekly_data = []
    for i in range(7):
        day_date = date.today() - timedelta(days=6-i)  # Start from 6 days ago to today
        day_moods = db.query(MoodLog).filter(
            MoodLog.user_id == current_user.id,
            MoodLog.logged_at >= day_date,
            MoodLog.logged_at < day_date + timedelta(days=1)
        ).all()
        
        if day_moods:
            # Use the most recent mood of the day
            latest_mood = day_moods[0]
            weekly_data.append({
                "date": day_date.strftime("%Y-%m-%d"),
                "score": latest_mood.score,
                "emotion": latest_mood.emotion
            })
        else:
            weekly_data.append({
                "date": day_date.strftime("%Y-%m-%d"),
                "score": 60,  # Neutral score
                "emotion": "neutral"
            })
    
    return {
        "streak": streak,
        "sessions": sessions,
        "avg_mood_score": avg_mood_score,
        "weekly_data": weekly_data
    }

@app.get("/")
async def health():
    return {"status": "CalmSphere API running", "version": "1.0.0"}
