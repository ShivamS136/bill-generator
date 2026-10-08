import { useState } from 'react'
import { buttonClass } from '../components/ui'
import { clearStoredData } from '../lib/storage'

export function ClearDataButton() {
  const [isCleared, setIsCleared] = useState(false)

  function handleClick() {
    if (!window.confirm('Delete all form entries and signatures saved in this browser?')) return
    clearStoredData()
    setIsCleared(true)
  }

  return (
    <button
      type="button"
      className={buttonClass('ghost')}
      onClick={handleClick}
      disabled={isCleared}
    >
      {isCleared ? 'Saved data cleared' : 'Clear saved data'}
    </button>
  )
}
