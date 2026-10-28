# models/database.py — SQLAlchemy ORM Models for CalmSphere

from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/calmsphere")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ─── Models ───────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"
    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String(100), nullable=False)
    email        = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    language     = Column(String(5), default="en")
    mode         = Column(String(10), default="text")
    created_at   = Column(DateTime, default=datetime.utcnow)
    is_active    = Column(Boolean, default=True)

    messages     = relationship("ChatMessage", back_populates="user")
    mood_logs    = relationship("MoodLog", back_populates="user")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    role         = Column(String(10))       # 'user' or 'assistant'
    content      = Column(Text, nullable=False)
    language     = Column(String(5), default="en")
    emotion      = Column(String(20))       # detected emotion
    sentiment_score = Column(Float)
    created_at   = Column(DateTime, default=datetime.utcnow)

    user         = relationship("User", back_populates="messages")


class MoodLog(Base):
    __tablename__ = "mood_logs"
    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    emotion      = Column(String(20), nullable=False)
    score        = Column(Integer)          # 0–100
    note         = Column(Text)
    logged_at    = Column(DateTime, default=datetime.utcnow)

    user         = relationship("User", back_populates="mood_logs")


class Session(Base):
    __tablename__ = "sessions"
    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    started_at   = Column(DateTime, default=datetime.utcnow)
    ended_at     = Column(DateTime)
    message_count = Column(Integer, default=0)
    dominant_emotion = Column(String(20))


# ─── DB Init ──────────────────────────────────────────────────────────────────

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
