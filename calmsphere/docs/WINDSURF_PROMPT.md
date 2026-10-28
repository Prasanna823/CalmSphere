# CalmSphere — Windsurf AI Prompt
# Paste this entire prompt into Windsurf to complete the full-stack build

---

## PROJECT OVERVIEW

You are completing **CalmSphere** — a full-stack AI-powered multilingual mental health companion app. The frontend prototype (HTML/CSS/JS) and backend scaffolding (FastAPI + SQLAlchemy models) are already built. Your job is to wire everything together into a production-ready system.

---

## EXISTING PROJECT STRUCTURE

```
calmsphere/
├── frontend/
│   └── index.html              ← Working prototype (4 pages, Claude AI chat)
├── backend/
│   ├── main.py                 ← FastAPI routes (scaffolded, TODOs inside)
│   ├── requirements.txt        ← All Python dependencies
│   ├── .env.example            ← Environment variable template
│   └── models/
│       └── database.py         ← SQLAlchemy ORM models (User, ChatMessage, MoodLog, Session)
```

---

## WHAT IS ALREADY DONE ✅

### Frontend (index.html)
- [x] Login / Register page with form validation and tab switching
- [x] Preferences page — language selection (English, Hindi, Telugu) + mode (Text/Voice)
- [x] Chat page — real Claude AI via Anthropic API, emotion detection, typing indicator, quick chips, language cycling
- [x] Mood Dashboard — weekly bar chart, session counter, streak, mood score, suggestion cards, Indian helplines
- [x] Dark theme with DM Serif Display + DM Sans fonts
- [x] Multilingual UI in English, Hindi, Telugu

### Backend (main.py + models/database.py)
- [x] FastAPI app with CORS configured
- [x] JWT auth structure (register + login endpoints scaffolded)
- [x] SQLAlchemy ORM models: User, ChatMessage, MoodLog, Session
- [x] All API route stubs: /api/auth/register, /api/auth/login, /api/preferences, /api/chat, /api/mood, /api/dashboard
- [x] requirements.txt with all dependencies

---

## WHAT NEEDS TO BE BUILT ❌

### TASK 1 — Convert Frontend to React + Vite

Create a new React + Vite project in `frontend/` with this structure:
```
frontend/
├── src/
│   ├── main.jsx
│   ├── App.jsx                 ← React Router setup (4 routes)
│   ├── pages/
│   │   ├── AuthPage.jsx        ← Login/Register
│   │   ├── PreferencesPage.jsx ← Language + Mode selection
│   │   ├── ChatPage.jsx        ← AI Chat interface
│   │   └── DashboardPage.jsx   ← Mood tracking
│   ├── components/
│   │   ├── MessageBubble.jsx
│   │   ├── TypingIndicator.jsx
│   │   ├── MoodChart.jsx       ← Chart.js bar chart
│   │   ├── EmotionTag.jsx
│   │   └── HelplineCard.jsx
│   ├── utils/
│   │   ├── api.js              ← Axios instance with base URL + JWT interceptor
│   │   ├── auth.js             ← JWT token storage/retrieval helpers
│   │   └── emotions.js         ← Emotion detection regex logic
│   └── store/
│       └── userStore.js        ← Zustand store (user, language, preferences, chat history)
├── tailwind.config.js
├── vite.config.js
└── package.json
```

**Exact UI to replicate** — match the prototype's dark theme:
- Background: #0d1117, Surface: #161b22, Border: #30363d
- Accent green: #7ee8a2, Purple: #c084fc
- Fonts: DM Serif Display (headings), DM Sans (body) via Google Fonts

**Dependencies to install:**
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install react-router-dom axios zustand chart.js react-chartjs-2 @tailwindcss/vite
```

---

### TASK 2 — Complete FastAPI Backend

In `backend/main.py`, complete all TODO sections:

#### 2a. Database Connection
- Connect SQLAlchemy to PostgreSQL using DATABASE_URL from .env
- Call `init_db()` on startup to create all tables
- Use `get_db()` dependency injection in all routes

#### 2b. Auth Routes (complete the TODOs)
```python
# POST /api/auth/register
# - Check if email already exists → 409 Conflict if yes
# - Hash password with bcrypt
# - Insert User row into DB
# - Return JWT token + user name

# POST /api/auth/login
# - Fetch user by email from DB
# - Verify password with bcrypt
# - Return JWT token + user name
```

#### 2c. JWT Middleware
Create `backend/middleware/auth.py`:
```python
# get_current_user(token: str) → decode JWT → return user_id
# Use as Depends() in protected routes
```

#### 2d. Chat Route (most important)
Complete `POST /api/chat` with this pipeline:
```python
# 1. Translate input to English (if language != 'en') using deep-translator
#    from deep_translator import GoogleTranslator
#    translated = GoogleTranslator(source=lang, target='en').translate(text)

# 2. Sentiment analysis using TextBlob
#    from textblob import TextBlob
#    sentiment = TextBlob(translated).sentiment.polarity  # -1.0 to 1.0

# 3. Call Anthropic Claude API
#    import anthropic
#    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
#    response = client.messages.create(model="claude-sonnet-4-20250514", ...)

# 4. Translate response back to user's language using deep-translator

# 5. Save ChatMessage rows (user + assistant) to DB

# 6. Log MoodLog entry with detected emotion + sentiment score

# 7. Return: { response, sentiment, emotion, language }
```

#### 2e. Dashboard Route
Complete `GET /api/dashboard`:
```python
# Query DB for current user:
# - streak = consecutive days with at least 1 mood log
# - sessions = count of Session rows
# - avg_mood_score = average of MoodLog.score for last 30 days
# - weekly_data = last 7 MoodLog entries grouped by date
```

#### 2f. Mood Route
Complete `POST /api/mood`:
```python
# Insert MoodLog row with: user_id, emotion, score, note, timestamp
```

---

### TASK 3 — Rasa Chatbot Engine (Optional but impressive for demo)

Create `backend/rasa/` folder with:

```yaml
# domain.yml — intents + responses
intents:
  - greet
  - express_anxiety
  - express_sadness
  - express_stress
  - ask_for_help
  - goodbye

responses:
  utter_greet:
    - text: "Hello! I'm here to listen. How are you feeling?"
  utter_express_anxiety:
    - text: "I hear you. Anxiety can feel overwhelming. Let's work through this together."
```

```yaml
# data/nlu.yml — training examples
version: "3.1"
nlu:
- intent: express_anxiety
  examples: |
    - I'm feeling anxious
    - I have anxiety
    - I'm worried about everything
    - I feel panicky
    - मैं चिंतित हूं
    - నాకు ఆందోళనగా ఉంది
```

Wire Rasa into `/api/chat` using httpx:
```python
async with httpx.AsyncClient() as client:
    rasa_response = await client.post(
        f"{RASA_SERVER_URL}/webhooks/rest/webhook",
        json={"sender": str(user_id), "message": translated_text}
    )
    intent = rasa_response.json()[0].get("text", "")
```

---

### TASK 4 — Voice Support

In `ChatPage.jsx`, implement Web Speech API:
```javascript
const startVoice = () => {
  const recognition = new window.SpeechRecognition() || new window.webkitSpeechRecognition();
  recognition.lang = selectedLang === 'hi' ? 'hi-IN' : selectedLang === 'te' ? 'te-IN' : 'en-US';
  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    setChatInput(transcript);
    sendMessage(transcript);
  };
  recognition.start();
};
```

For TTS response (speak bot replies aloud):
```javascript
const speakResponse = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = selectedLang === 'hi' ? 'hi-IN' : selectedLang === 'te' ? 'te-IN' : 'en-US';
  window.speechSynthesis.speak(utterance);
};
```

---

### TASK 5 — Wire Frontend to Backend

In `frontend/src/utils/api.js`:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('calmsphere_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
};

export const chatAPI = {
  send: (message, language) => api.post('/api/chat', { message, language }),
};

export const moodAPI = {
  log: (entry) => api.post('/api/mood', entry),
  history: (days=7) => api.get(`/api/mood/history?days=${days}`),
  dashboard: () => api.get('/api/dashboard'),
};
```

Replace frontend's direct `fetch('https://api.anthropic.com/...')` calls with `chatAPI.send()` — the API key should only live in the backend `.env`.

---

### TASK 6 — Deployment Setup

#### Frontend (Vercel)
Create `frontend/.env.production`:
```
VITE_API_URL=https://your-backend.railway.app
```

Create `frontend/vercel.json`:
```json
{
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
}
```

#### Backend (Railway or Render)
Create `backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Create `backend/Procfile` (for Render):
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## ENVIRONMENT VARIABLES NEEDED

### Backend `.env`
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
ANTHROPIC_API_KEY=sk-ant-...
RASA_SERVER_URL=http://localhost:5005
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:8000
```

---

## RUNNING LOCALLY

```bash
# Terminal 1 — Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your values
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev   # runs on http://localhost:5173

# Terminal 3 — Rasa (optional)
cd backend/rasa
rasa train
rasa run --enable-api --port 5005

# PostgreSQL
# Make sure PostgreSQL is running and create DB:
# psql -U postgres -c "CREATE DATABASE calmsphere;"
```

---

## ACCEPTANCE CRITERIA

When complete, the app should:
1. ✅ Register / login a user with email + password, store JWT in localStorage
2. ✅ Save language + mode preferences to DB
3. ✅ Send a message → FastAPI → translate → Claude API → translate back → return to UI
4. ✅ Detect emotion from user input, log MoodEntry to DB
5. ✅ Dashboard shows real data from DB (not mock data)
6. ✅ Voice input works in English, Hindi, and Telugu
7. ✅ All API keys are in backend .env only (never in frontend)
8. ✅ App deploys successfully to Vercel (frontend) + Railway (backend)

---

## TECH STACK SUMMARY

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS + Zustand + Chart.js |
| Backend | FastAPI + SQLAlchemy + PostgreSQL |
| AI Chat | Anthropic Claude (claude-sonnet-4-20250514) |
| Chatbot Engine | Rasa (intent classification) |
| Sentiment | TextBlob + Transformers |
| Translation | deep-translator (GoogleTranslator) |
| Auth | JWT + bcrypt |
| Voice | Web Speech API (browser-native) |
| Deployment | Vercel (frontend) + Railway/Render (backend) + Docker |
