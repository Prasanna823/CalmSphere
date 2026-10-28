import React from 'react'

const TypingIndicator = () => {
  return (
    <div className="self-start items-start max-w-[75%]">
      <div className="bg-bg2 border border-border rounded-[18px] rounded-bl-sm px-4 py-3 w-fit">
        <div className="flex items-center gap-1">
          <div className="w-1.75 h-1.75 bg-text3 rounded-full animate-[typingBounce_1.2s_infinite]"></div>
          <div className="w-1.75 h-1.75 bg-text3 rounded-full animate-[typingBounce_1.2s_infinite]" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1.75 h-1.75 bg-text3 rounded-full animate-[typingBounce_1.2s_infinite]" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
