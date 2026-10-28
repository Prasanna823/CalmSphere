// Voice support using Web Speech API

export const startVoiceRecognition = (onResult, onError, lang = 'en') => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    onError('Speech recognition not supported in this browser')
    return null
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()

  // Set language based on selected language
  const langMap = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'te': 'te-IN'
  }
  recognition.lang = langMap[lang] || 'en-US'

  recognition.continuous = false
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    onResult(transcript)
  }

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error)
    onError(`Speech recognition error: ${event.error}`)
  }

  recognition.onend = () => {
    console.log('Speech recognition ended')
  }

  recognition.start()
  return recognition
}

export const speakText = (text, lang = 'en') => {
  if (!('speechSynthesis' in window)) {
    console.error('Text-to-speech not supported in this browser')
    return
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)

  // Set language based on selected language
  const langMap = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'te': 'te-IN'
  }
  utterance.lang = langMap[lang] || 'en-US'

  utterance.rate = 0.9
  utterance.pitch = 1
  utterance.volume = 1

  window.speechSynthesis.speak(utterance)
}

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

export const isVoiceSupported = () => {
  return ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) &&
         ('speechSynthesis' in window)
}
