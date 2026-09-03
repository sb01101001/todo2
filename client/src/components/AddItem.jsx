import { useState } from 'react'
import { PlusIcon } from './icons'

const PLACEHOLDER = {
  work: 'Add a work task...',
  shopping: 'Add an item...',
  personal: 'Add a personal task...',
}

export default function AddItem({ tab, accentColor, onAdd }) {
  const [text, setText] = useState('')

  const submit = () => {
    if (!text.trim()) return
    onAdd(text.trim())
    setText('')
  }

  return (
    <label className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 cursor-text">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder={PLACEHOLDER[tab]}
        className="flex-1 text-sm text-gray-700 placeholder-gray-300 bg-transparent outline-none"
      />
      <button
        onClick={(e) => { e.preventDefault(); submit() }}
        disabled={!text.trim()}
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-opacity disabled:opacity-25"
        style={{ backgroundColor: accentColor, color: 'white' }}
        aria-label="Add item"
      >
        <PlusIcon />
      </button>
    </label>
  )
}
