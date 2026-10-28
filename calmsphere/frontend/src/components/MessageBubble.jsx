import React from 'react'
import { getEmotionLabel, getEmotionColor } from '../utils/emotions'

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user'
  const time = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  return (
    <div className={`max-w-[75%] flex flex-col gap-1 animate-[msgIn_0.25s_ease] ${
      isUser ? 'self-end items-end' : 'self-start items-start'
    }`}>
      {/* Emotion tag for user messages */}
      {isUser && message.emotion && message.emotion !== 'neutral' && (
        <div className={`inline-flex items-center gap-1 px-2 py-0.75 rounded-full text-xs font-medium mb-1 ${getEmotionColor(message.emotion)}`}>
          {getEmotionLabel(message.emotion)}
        </div>
      )}
      
      {/* Message bubble */}
      <div className={`px-4 py-3 rounded-[18px] text-sm leading-7 ${
        isUser 
          ? 'bg-gradient-to-br from-accent to-accent2 text-bg rounded-br-sm' 
          : 'bg-bg2 border border-border text-text rounded-bl-sm'
      }`}>
        {message.content.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < message.content.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
      
      {/* Timestamp */}
      <div className="text-xs text-text3 px-1">{time}</div>
    </div>
  )
}

export default MessageBubble
