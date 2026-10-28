import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { moodAPI } from '../utils/api'
import MoodChart from '../components/MoodChart'
import HelplineCard from '../components/HelplineCard'

const DashboardPage = () => {
  const navigate = useNavigate()
  const { moodLog, sessionCount, streakCount } = useUserStore()
  const [dashboardData, setDashboardData] = useState({
    streak: 0,
    sessions: 0,
    avgMoodScore: 0,
    weeklyData: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await moodAPI.dashboard()
      setDashboardData(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Use local data as fallback
      setDashboardData({
        streak: streakCount,
        sessions: sessionCount,
        avgMoodScore: calculateAverageMood(),
        weeklyData: getWeeklyData()
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateAverageMood = () => {
    if (moodLog.length === 0) return 0
    
    const emotionScores = {
      calm: 90,
      neutral: 65,
      anxious: 40,
      sad: 35,
      stressed: 45
    }
    
    const totalScore = moodLog.reduce((sum, entry) => {
      return sum + (emotionScores[entry.emotion] || 60)
    }, 0)
    
    return Math.round(totalScore / moodLog.length)
  }

  const getWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const today = new Date().getDay()
    const adjustedToday = today === 0 ? 6 : today - 1 // Adjust for Monday start
    
    return days.map((day, index) => {
      const dayIndex = (adjustedToday - index + 7) % 7
      const dayMood = moodLog[moodLog.length - 1 - dayIndex]
      
      if (dayMood) {
        const emotionScores = {
          calm: 90,
          neutral: 65,
          anxious: 40,
          sad: 35,
          stressed: 45
        }
        
        return {
          day,
          score: emotionScores[dayMood.emotion] || 60,
          emotion: dayMood.emotion
        }
      }
      
      return {
        day,
        score: Math.floor(20 + Math.random() * 40),
        emotion: 'neutral'
      }
    }).reverse()
  }

  const suggestions = [
    {
      icon: '🌬️',
      title: 'Guided Breathing',
      description: '4-7-8 breathing to calm your nervous system',
      topic: 'guided breathing'
    },
    {
      icon: '🧘',
      title: 'Body Scan Meditation',
      description: '10-minute mindfulness exercise',
      topic: 'body scan meditation'
    },
    {
      icon: '📓',
      title: 'Journaling',
      description: 'Structured prompts for emotional clarity',
      topic: 'journaling prompts'
    },
    {
      icon: '💪',
      title: 'PMR Exercise',
      description: 'Progressive muscle relaxation technique',
      topic: 'progressive muscle relaxation'
    }
  ]

  const handleSuggestionClick = (topic) => {
    navigate('/chat')
    setTimeout(() => {
      // This would be handled by the chat component
      window.dispatchEvent(new CustomEvent('suggestTopic', { detail: topic }))
    }, 300)
  }

  const goToChat = () => {
    navigate('/chat')
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-text2">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-[760px] w-full mx-auto">
      {/* Header */}
      <div className="bg-bg2 border-b border-border p-4 flex items-center justify-between flex-shrink-0">
        <div className="font-head text-xl">Mood Dashboard</div>
        <button 
          onClick={goToChat}
          className="bg-bg3 border border-border rounded-sm px-2.5 py-1 text-sm text-text2 cursor-pointer transition-all hover:bg-bg4 hover:text-text"
        >
          💬
        </button>
      </div>

      <div className="p-5 pt-5">
        {/* Mood Overview Cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-bg2 border border-border rounded-card p-4 text-center">
            <div className="font-head text-2xl mb-0.5 text-accent">{dashboardData.streak}</div>
            <div className="text-xs text-text2 tracking-[0.3px]">Day Streak</div>
          </div>
          <div className="bg-bg2 border border-border rounded-card p-4 text-center">
            <div className="font-head text-2xl mb-0.5 text-blue">{dashboardData.sessions}</div>
            <div className="text-xs text-text2 tracking-[0.3px]">Sessions</div>
          </div>
          <div className="bg-bg2 border border-border rounded-card p-4 text-center">
            <div className="font-head text-2xl mb-0.5 text-purple">
              {dashboardData.avgMoodScore || '--'}
            </div>
            <div className="text-xs text-text2 tracking-[0.3px]">Mood Score</div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="bg-bg2 border border-border rounded-card p-5 mb-5">
          <div className="text-sm font-semibold mb-4 flex items-center gap-2">
            Weekly Mood <span className="text-xs text-text2 font-normal">Last 7 days</span>
          </div>
          <MoodChart data={dashboardData.weeklyData} />
        </div>

        {/* Recommendations */}
        <div className="text-xs font-semibold tracking-[1px] text-text3 uppercase mb-3">Recommendations</div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion.topic)}
              className="bg-bg2 border border-border rounded-card p-4 cursor-pointer transition-all hover:border-accent3 hover:translate-y-[-2px] text-left"
            >
              <div className="text-xl mb-2">{suggestion.icon}</div>
              <div className="text-sm font-semibold mb-1">{suggestion.title}</div>
              <div className="text-xs text-text2 leading-5">{suggestion.description}</div>
            </button>
          ))}
        </div>

        {/* Helplines */}
        <HelplineCard />
      </div>
    </div>
  )
}

export default DashboardPage
