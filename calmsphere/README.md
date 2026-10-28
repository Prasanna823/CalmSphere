# CalmSphere — AI-Powered Mental Health Companion

CalmSphere is a full-stack multilingual mental health companion app that provides AI-powered emotional support in English, Hindi, and Telugu.

## 🌟 Features

- **Multilingual Support**: English, Hindi, and Telugu with real-time translation
- **AI Chat**: Claude AI integration for compassionate mental health conversations
- **Voice Support**: Speech-to-text and text-to-speech in all supported languages
- **Emotion Detection**: Real-time sentiment analysis and emotion tracking
- **Mood Dashboard**: Visual mood tracking with streaks and insights
- **Secure Authentication**: JWT-based user authentication
- **Responsive Design**: Beautiful dark-themed UI optimized for all devices

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite** for fast development
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Chart.js** for mood visualization
- **Web Speech API** for voice features
- **Axios** for API communication

### Backend
- **FastAPI** for high-performance API
- **PostgreSQL** for data storage
- **SQLAlchemy** for ORM
- **JWT** for authentication
- **Anthropic Claude** for AI responses
- **TextBlob** for sentiment analysis
- **deep-translator** for multilingual support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 13+

### Backend Setup

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

5. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb calmsphere
   
   # Update DATABASE_URL in .env
   DATABASE_URL=postgresql://username:password@localhost:5432/calmsphere
   ```

6. **Start the backend**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   # .env is already configured for development
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the frontend**
   ```bash
   npm run dev
   ```

### Access the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🌐 Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/calmsphere

# Authentication
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# AI Services
ANTHROPIC_API_KEY=sk-ant-your-key-here

# App Settings
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8000
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set `VITE_API_URL` environment variable to your backend URL
3. Deploy automatically on push to main branch

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set all environment variables from `.env.example`
3. Railway will build and deploy using the `Dockerfile`
4. For Render, the `Procfile` will be used

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Chat
- `POST /api/chat` - Send message to AI

### Mood Tracking
- `POST /api/mood` - Log mood entry
- `GET /api/mood/history` - Get mood history
- `GET /api/dashboard` - Get dashboard stats

### Preferences
- `POST /api/preferences` - Save user preferences

## 🎨 UI Components

The app features a beautiful dark theme with:
- **Color Palette**: Dark backgrounds with green accent colors
- **Typography**: DM Serif Display for headings, DM Sans for body
- **Components**: Message bubbles, mood charts, voice controls
- **Responsive**: Mobile-first design that works on all devices

## 🔧 Development

### Adding New Languages
1. Update language options in `PreferencesPage.jsx`
2. Add translation mappings in `ChatPage.jsx`
3. Update voice recognition languages in `voice.js`

### Extending AI Features
- Modify the system prompt in `main.py` chat endpoint
- Add new emotion patterns in `detect_emotion()` function
- Extend mood tracking with additional metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Helplines

The app includes mental health helplines for India:
- iCall: 9152987821
- Vandrevala Foundation: 1860-2662-345
- NIMHANS: 080-46110007
- Snehi NGO: 044-24640050

**Disclaimer**: This app is not a substitute for professional medical advice. Always consult with qualified healthcare providers for mental health concerns.
