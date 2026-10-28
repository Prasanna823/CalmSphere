import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { preferencesAPI } from '../utils/api'

const PreferencesPage = () => {
  const navigate = useNavigate()
  const { user, setPreferences, language, mode } = useUserStore()
  const [selectedLang, setSelectedLang] = React.useState(language)
  const [selectedMode, setSelectedMode] = React.useState(mode)
  const [loading, setLoading] = React.useState(false)

  const languages = [
    { code: 'en', flag: '🇬🇧', name: 'English', native: 'English' },
    { code: 'hi', flag: '🇮🇳', name: 'Hindi', native: 'हिन्दी' },
    { code: 'te', flag: '🇮🇳', name: 'Telugu', native: 'తెలుగు' }
  ]

  const modes = [
    { code: 'text', icon: '💬', name: 'Text' },
    { code: 'voice', icon: '🎤', name: 'Voice (Soon)' }
  ]

  const handleSavePreferences = async () => {
    setLoading(true)
    try {
      await preferencesAPI.save({ language: selectedLang, mode: selectedMode })
      setPreferences({ language: selectedLang, mode: selectedMode })
      navigate('/chat')
    } catch (error) {
      console.error('Failed to save preferences:', error)
      // Still navigate even if API fails
      setPreferences({ language: selectedLang, mode: selectedMode })
      navigate('/chat')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-blue-500/6 via-transparent">
      <div className="w-full max-w-lg bg-bg2 border border-border rounded-[20px] p-10 shadow-card">
        <div className="font-head text-2xl mb-1.5">Your Preferences</div>
        <div className="text-sm text-text2 mb-8">Personalise CalmSphere to feel just right for you</div>

        {/* Language Selection */}
        <div className="text-xs font-semibold tracking-[1px] text-text3 uppercase mb-3">Language</div>
        <div className="grid grid-cols-3 gap-2.5 mb-7">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`bg-bg3 border-2 rounded-sm p-3.5 text-center cursor-pointer transition-all ${
                selectedLang === lang.code 
                  ? 'border-accent bg-accent/8' 
                  : 'border-border hover:border-accent3'
              }`}
            >
              <div className="text-xl mb-1">{lang.flag}</div>
              <div className="text-sm font-medium text-text">{lang.name}</div>
              <div className="text-xs text-text2 mt-0.5">{lang.native}</div>
            </button>
          ))}
        </div>

        {/* Mode Selection */}
        <div className="text-xs font-semibold tracking-[1px] text-text3 uppercase mb-3">Interaction Mode</div>
        <div className="grid grid-cols-2 gap-2.5 mb-7">
          {modes.map((modeOption) => (
            <button
              key={modeOption.code}
              onClick={() => setSelectedMode(modeOption.code)}
              className={`bg-bg3 border-2 rounded-sm p-4 cursor-pointer transition-all flex flex-col items-center gap-2 ${
                selectedMode === modeOption.code 
                  ? 'border-accent bg-accent/8' 
                  : 'border-border hover:border-accent3'
              }`}
            >
              <div className="text-2xl">{modeOption.icon}</div>
              <div className="text-sm font-medium">{modeOption.name}</div>
            </button>
          ))}
        </div>

        <button
          onClick={handleSavePreferences}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-br from-accent to-accent2 text-bg font-semibold text-sm rounded-sm cursor-pointer transition-all hover:opacity-90 hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Start My Session →'}
        </button>
      </div>
    </div>
  )
}

export default PreferencesPage
