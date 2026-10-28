import React from 'react'

const HelplineCard = () => {
  const helplines = [
    { name: 'iCall (India)', number: '9152987821' },
    { name: 'Vandrevala Foundation', number: '1860-2662-345' },
    { name: 'NIMHANS Helpline', number: '080-46110007' },
    { name: 'Snehi NGO', number: '044-24640050' }
  ]

  return (
    <div className="bg-red-500/8 border border-red-500/25 rounded-card p-4">
      <div className="text-sm font-semibold text-red-400 mb-2.5 flex items-center gap-1.5">
        ⚠️ Need Immediate Help?
      </div>
      <div className="space-y-2">
        {helplines.map((helpline, index) => (
          <div 
            key={index}
            className="flex items-center justify-between py-2 border-b border-red-500/10 last:border-b-0 text-sm"
          >
            <span>{helpline.name}</span>
            <span className="text-red-400 font-semibold text-sm">{helpline.number}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HelplineCard
