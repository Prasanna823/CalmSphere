import React from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import PreferencesPage from './pages/PreferencesPage'
import ChatPage from './pages/ChatPage'
import DashboardPage from './pages/DashboardPage'
import { useUserStore } from './store/userStore'

function App() {
  const { user, token } = useUserStore()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (token && user) {
      navigate('/chat')
    }
  }, [token, user, navigate])

  return (
    <Router>
      <div className="min-h-screen bg-bg text-text font-body">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
