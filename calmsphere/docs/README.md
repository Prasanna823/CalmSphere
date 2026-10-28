# 🧘 CalmSphere — AI Mental Health Companion

A multilingual AI-powered mental health chatbot supporting English, Hindi, and Telugu.

---

## ✅ WHAT IS BUILT (Current Prototype)

### Frontend (`frontend/index.html`)
| Feature | Status |
|---|---|
| Login / Register page | ✅ Done |
| Preferences — Language (EN/HI/TE) | ✅ Done |
| Preferences — Mode (Text/Voice) | ✅ Done |
| Chat UI (WhatsApp-style) | ✅ Done |
| Real Claude AI responses | ✅ Done |
| Emotion detection + tags | ✅ Done |
| Typing indicator | ✅ Done |
| Language switching mid-chat | ✅ Done |
| Quick reply chips (multilingual) | ✅ Done |
| Mood Dashboard | ✅ Done |
| Weekly mood bar chart | ✅ Done |
| Wellness suggestion cards | ✅ Done |
| Indian helpline numbers | ✅ Done |
| Dark theme UI | ✅ Done |

### Backend (`backend/`)
| Feature | Status |
|---|---|
| FastAPI app setup + CORS | ✅ Done |
| JWT auth route stubs | ✅ Scaffolded |
| SQLAlchemy ORM models | ✅ Done |
| All API route stubs | ✅ Scaffolded |
| requirements.txt | ✅ Done |
| .env.example | ✅ Done |

---

## ❌ WHAT STILL NEEDS TO BE BUILT

### Frontend
| Feature | Priority |
|---|---|
| Convert to React + Vite | 🔴 High |
| Zustand global state store | 🔴 High |
| Axios API layer (replace direct fetch) | 🔴 High |
| JWT token storage + auth guard | 🔴 High |
| Chart.js real data integration | 🟡 Medium |
| Voice input (Web Speech API) | 🟡 Medium |
| TTS for bot responses | 🟢 Low |

### Backend
| Feature | Priority |
|---|---|
| PostgreSQL connection (complete TODOs) | 🔴 High |
| Auth: register + login with real DB | 🔴 High |
| JWT middleware / Depends() | 🔴 High |
| Chat route: full pipeline | 🔴 High |
| Translation (deep-translator) | 🔴 High |
| Sentiment analysis (TextBlob) | 🟡 Medium |
| Mood logging to DB | 🟡 Medium |
| Dashboard real data from DB | 🟡 Medium |
| Rasa integration | 🟢 Low |
| Alembic DB migrations | 🟡 Medium |

### DevOps
| Feature | Priority |
|---|---|
| Dockerfile for backend | 🟡 Medium |
| Vercel config for frontend | 🟡 Medium |
| Railway / Render deployment | 🟢 Low |
| Environment secrets setup | 🔴 High |

---

## 🚀 QUICK START

```bash
# Open the working prototype right now:
open frontend/index.html

# Start backend (after filling .env):
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 📁 PROJECT STRUCTURE

```
calmsphere/
├── frontend/
│   └── index.html              ← Full working prototype
├── backend/
│   ├── main.py                 ← FastAPI (scaffolded)
│   ├── requirements.txt
│   ├── .env.example
│   └── models/
│       └── database.py         ← SQLAlchemy models
└── docs/
    ├── README.md               ← This file
    └── WINDSURF_PROMPT.md      ← Paste into Windsurf to complete the build
```

---

## 🤖 AI Models Used
- **Claude Sonnet** (claude-sonnet-4-20250514) — empathetic chat responses
- **TextBlob** — sentiment analysis
- **Rasa** — intent classification (to be integrated)
- **deep-translator** — EN ↔ HI ↔ TE translation

## 🌍 Supported Languages
- 🇬🇧 English
- 🇮🇳 Hindi (हिन्दी)
- 🇮🇳 Telugu (తెలుగు)
