// Emotion detection regex logic

export const detectEmotion = (text) => {
  const t = text.toLowerCase()
  
  // Anxiety patterns
  if (/anxious|anxiety|panic|worry|worried|nervous|restless|चिंत|ఆందోళన/.test(t)) {
    return 'anxious'
  }
  
  // Sadness patterns
  if (/sad|depressed|cry|hopeless|alone|lonely|unhappy|दुख|దిగులు/.test(t)) {
    return 'sad'
  }
  
  // Stress patterns
  if (/stress|overwhelm|pressure|tired|exhausted|burnout|तनाव|ఒత్తిడి/.test(t)) {
    return 'stressed'
  }
  
  // Calm patterns
  if (/calm|better|good|happy|grateful|peaceful|relaxed|ठीक|బాగుంది/.test(t)) {
    return 'calm'
  }
  
  return 'neutral'
}

export const getEmotionLabel = (emotion) => {
  const labels = {
    anxious: '😰 Anxious',
    sad: '😢 Sad',
    stressed: '😤 Stressed',
    calm: '😊 Calm',
    neutral: '🤍 Sharing'
  }
  return labels[emotion] || '🤍 Sharing'
}

export const getEmotionColor = (emotion) => {
  const colors = {
    anxious: 'bg-amber-100 text-amber-700',
    sad: 'bg-blue-100 text-blue-700',
    stressed: 'bg-red-100 text-red-700',
    calm: 'bg-green-100 text-green-700',
    neutral: 'bg-gray-100 text-gray-700'
  }
  return colors[emotion] || 'bg-gray-100 text-gray-700'
}

export const getEmotionScore = (emotion) => {
  const scores = {
    calm: 90,
    neutral: 65,
    anxious: 40,
    sad: 35,
    stressed: 45
  }
  return scores[emotion] || 60
}
