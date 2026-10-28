import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { chatAPI } from '../utils/api'
import { detectEmotion, getEmotionLabel, getEmotionColor } from '../utils/emotions'
import { startVoiceRecognition, speakText, stopSpeaking, isVoiceSupported } from '../utils/voice'
import MessageBubble from '../components/MessageBubble'
import TypingIndicator from '../components/TypingIndicator'

const ChatPage = () => {
  const navigate = useNavigate()
  const { user, language, mode, chatHistory, addChatMessage, addMoodLog, incrementSessionCount } = useUserStore()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentLang, setCurrentLang] = useState(language)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
    // Check voice support
    setVoiceSupported(isVoiceSupported())
  }, [chatHistory, isTyping])

  useEffect(() => {
    // Initialize chat with greeting if empty
    if (chatHistory.length === 0) {
      const greeting = getGreetingMessage(user?.name || 'Friend', currentLang)
      addChatMessage({ role: 'assistant', content: greeting, timestamp: new Date() })
    }
  }, [])

  const getGreetingMessage = (name, lang) => {
    const greetings = {
      en: `Hello ${name}! 🌿 I'm CalmSphere, your mental wellness companion. I'm here to listen without judgement. How are you feeling today?`,
      hi: `नमस्ते ${name}! 🌿 मैं CalmSphere हूं, आपका मानसिक स्वास्थ्य साथी। आज आप कैसा महसूस कर रहे हैं?`,
      te: `నమస్కారం ${name}! 🌿 నేను CalmSphere, మీ మానసిక ఆరోగ్య సహాయకుడిని. ఈరోజు మీరు ఎలా అనుభవిస్తున్నారు?`
    }
    return greetings[lang] || greetings.en
  }

  const getQuickChips = () => {
    const chips = {
      en: ["I feel anxious", "I'm stressed", "I feel sad", "I need motivation"],
      hi: ["मैं चिंतित हूं", "मैं तनाव में हूं", "मुझे दुख है", "मुझे प्रेरणा चाहिए"],
      te: ["నాకు ఆందోళనగా ఉంది", "నాకు ఒత్తిడిగా ఉంది", "నాకు దిగులుగా ఉంది", "నాకు ప్రేరణ కావాలి"]
    }
    return chips[currentLang] || chips.en
  }

  const getPlaceholder = () => {
    const placeholders = {
      en: "Share what's on your mind...",
      hi: 'अपने मन की बात कहें...',
      te: 'మీ మనసులో ఉన్నది చెప్పండి...'
    }
    return placeholders[currentLang] || placeholders.en
  }

  const cycleLanguage = () => {
    const langs = ['en', 'hi', 'te']
    const currentIndex = langs.indexOf(currentLang)
    const nextLang = langs[(currentIndex + 1) % 3]
    setCurrentLang(nextLang)
  }

  const handleQuickChip = (chip) => {
    setInput(chip)
    sendMessage(chip)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const autoResize = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }

  const sendMessage = async (messageText = null) => {
    const message = messageText || input.trim()
    if (!message) return

    const emotion = detectEmotion(message)
    const userMessage = { role: 'user', content: message, emotion, timestamp: new Date() }
    
    // Add user message
    addChatMessage(userMessage)
    addMoodLog({ emotion, message, timestamp: new Date() })
    incrementSessionCount()

    // Clear input
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Show typing indicator
    setIsTyping(true)

    try {
      const response = await chatAPI.send(message, currentLang)
      const botMessage = { 
        role: 'assistant', 
        content: response.data.response, 
        timestamp: new Date() 
      }
      addChatMessage(botMessage)
      
      // Auto-speak response if in voice mode
      if (mode === 'voice' && voiceSupported) {
        setIsSpeaking(true)
        speakText(response.data.response, currentLang)
        setTimeout(() => setIsSpeaking(false), 3000)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = { 
        role: 'assistant', 
        content: 'Connection error. Please try again.', 
        timestamp: new Date() 
      }
      addChatMessage(errorMessage)
    } finally {
      setIsTyping(false)
    }
  }

  const startVoiceInput = () => {
    if (!voiceSupported) {
      alert('Voice recognition is not supported in your browser')
      return
    }

    setIsListening(true)
    
    recognitionRef.current = startVoiceRecognition(
      (transcript) => {
        setInput(transcript)
        setIsListening(false)
        sendMessage(transcript)
      },
      (error) => {
        console.error('Voice recognition error:', error)
        setIsListening(false)
        alert('Voice recognition failed: ' + error)
      },
      currentLang
    )
  }

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking()
      setIsSpeaking(false)
    } else {
      // Speak the last assistant message
      const lastAssistantMessage = chatHistory
        .slice()
        .reverse()
        .find(msg => msg.role === 'assistant')
      
      if (lastAssistantMessage) {
        setIsSpeaking(true)
        speakText(lastAssistantMessage.content, currentLang)
        setTimeout(() => setIsSpeaking(false), 3000)
      }
    }
  }

  const goToDashboard = () => {
    navigate('/dashboard')
  }

  const getLangPill = () => {
    const pills = {
      en: '🇬🇧 EN',
      hi: '🇮🇳 HI',
      te: '🇮🇳 TE'
    }
    return pills[currentLang] || pills.en
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-bg2 border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9.5 h-9.5 bg-gradient-to-br from-accent to-purple rounded-full flex items-center justify-center text-lg">
            🧘
          </div>
          <div>
            <div className="font-semibold text-sm">CalmSphere AI</div>
            <div className="text-xs text-accent flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
              Online · Ready to listen
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={cycleLanguage}
            className="bg-bg3 border border-border rounded-sm px-2.5 py-1 text-xs text-text2 cursor-pointer transition-all hover:border-accent hover:text-text"
          >
            {getLangPill()}
          </button>
          {voiceSupported && (
            <>
              <button
                onClick={startVoiceInput}
                disabled={isListening}
                className={`bg-bg3 border border-border rounded-sm px-2.5 py-1 text-sm cursor-pointer transition-all ${
                  isListening 
                    ? 'border-red text-red animate-pulse' 
                    : 'text-text2 hover:bg-bg4 hover:text-text'
                }`}
              >
                {isListening ? '🔴' : '🎤'}
              </button>
              <button
                onClick={toggleSpeaking}
                disabled={isSpeaking}
                className={`bg-bg3 border border-border rounded-sm px-2.5 py-1 text-sm cursor-pointer transition-all ${
                  isSpeaking 
                    ? 'border-green text-green animate-pulse' 
                    : 'text-text2 hover:bg-bg4 hover:text-text'
                }`}
              >
                {isSpeaking ? '🔊' : '🔇'}
              </button>
            </>
          )}
          <button 
            onClick={goToDashboard}
            className="bg-bg3 border border-border rounded-sm px-2.5 py-1 text-sm text-text2 cursor-pointer transition-all hover:bg-bg4 hover:text-text"
          >
            📊
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3.5 min-h-0" style={{ height: 'calc(100vh - 200px)' }}>
        {chatHistory.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-bg2 border-t border-border p-4">
        {/* Quick Chips */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {getQuickChips().map((chip, index) => (
            <button
              key={index}
              onClick={() => handleQuickChip(chip)}
              className="bg-bg3 border border-border rounded-full px-3 py-1.5 text-xs text-text2 cursor-pointer transition-all hover:border-accent hover:text-text whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>
        
        {/* Input Row */}
        <div className="flex gap-2.5 items-end">
          {voiceSupported && (
            <button
              onClick={isListening ? stopVoiceInput : startVoiceInput}
              disabled={isListening}
              className={`w-10.5 h-10.5 border-none rounded-full cursor-pointer flex items-center justify-center text-lg transition-all flex-shrink-0 ${
                isListening
                  ? 'bg-red text-white animate-pulse'
                  : 'bg-bg3 border border-border text-text2 hover:bg-bg4 hover:text-text'
              }`}
            >
              {isListening ? '🔴' : '🎤'}
            </button>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              autoResize()
            }}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? 'Listening...' : getPlaceholder()}
            className="flex-1 bg-bg3 border border-border rounded-full px-4 py-2.5 text-text text-sm outline-none resize-none transition-all focus:border-accent max-h-[120px] leading-6"
            rows="1"
            disabled={isListening}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isListening}
            className="w-10.5 h-10.5 bg-gradient-to-br from-accent to-accent2 border-none rounded-full cursor-pointer flex items-center justify-center text-lg transition-all hover:scale-105 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
