import { useState, useEffect, useCallback, useRef } from 'react'
import TabNav from './components/TabNav'
import ItemList from './components/ItemList'
import AddItem from './components/AddItem'
import UndoToast from './components/UndoToast'
import * as api from './api'

const TAB_COLOR = {
  work: '#3B82F6',
  shopping: '#10B981',
  personal: '#8B5CF6',
}

export default function App() {
  const [activeTab, setActiveTab] = useState('work')
  const [items, setItems] = useState({ work: [], shopping: [], personal: [] })
  const [undoStack, setUndoStack] = useState([])
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)

  // Ref so the stable Ctrl+Z handler always sees the latest undo stack
  const undoRef = useRef([])
  useEffect(() => { undoRef.current = undoStack }, [undoStack])

  const toastTimer = useRef(null)

  // Load items whenever tab changes
  useEffect(() => {
    setLoading(true)
    api.getItems(activeTab)
      .then((data) => setItems((prev) => ({ ...prev, [activeTab]: data })))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeTab])

  const showToast = (msg) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 5000)
  }

  const dismissToast = () => {
    clearTimeout(toastTimer.current)
    setToast(null)
  }

  const handleUndo = useCallback(async () => {
    const stack = undoRef.current
    if (stack.length === 0) return
    const last = stack[stack.length - 1]
    setUndoStack((prev) => prev.slice(0, -1))
    dismissToast()
    try {
      const restored = await api.restoreItem({
        tab: last.tab,
        text: last.text,
        completed: last.completed,
        position: last.position,
      })
      setItems((prev) => {
        const list = [...prev[last.tab]]
        const insertAt = Math.min(last.originalIndex, list.length)
        list.splice(insertAt, 0, restored)
        return { ...prev, [last.tab]: list }
      })
    } catch (e) {
      console.error('Restore failed', e)
    }
  }, []) // stable — reads undo state via ref

  // Global Ctrl+Z / Cmd+Z
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        handleUndo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleUndo])

  const handleAdd = async (text) => {
    try {
      const item = await api.addItem(activeTab, text)
      setItems((prev) => ({ ...prev, [activeTab]: [...prev[activeTab], item] }))
    } catch (e) {
      console.error('Add failed', e)
    }
  }

  const handleDelete = async (id) => {
    const snapshot = items[activeTab]
    const item = snapshot.find((i) => i.id === id)
    const originalIndex = snapshot.findIndex((i) => i.id === id)

    // Optimistic remove
    setItems((prev) => ({ ...prev, [activeTab]: prev[activeTab].filter((i) => i.id !== id) }))

    try {
      await api.deleteItem(id)
      setUndoStack((prev) => [...prev.slice(-9), { ...item, originalIndex }])
      showToast('Item deleted')
    } catch (e) {
      // Revert
      setItems((prev) => {
        const list = [...prev[activeTab]]
        list.splice(originalIndex, 0, item)
        return { ...prev, [activeTab]: list }
      })
    }
  }

  const handleReorder = async (newItems) => {
    setItems((prev) => ({ ...prev, [activeTab]: newItems }))
    try {
      await api.reorderItems(activeTab, newItems.map((i) => i.id))
    } catch (e) {
      console.error('Reorder failed', e)
    }
  }

  const accentColor = TAB_COLOR[activeTab]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Lists</h1>
            <p className="text-sm text-gray-400 mt-1">Everything in one place</p>
          </div>
          {undoStack.length > 0 && (
            <button
              onClick={handleUndo}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4h7a4 4 0 010 8H4" />
                <polyline points="1,1 1,4 4,4" />
              </svg>
              Undo
            </button>
          )}
        </div>

        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-4 overflow-hidden" style={{ minHeight: 220 }}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-400 animate-spin" />
            </div>
          ) : (
            <>
              <ItemList
                items={items[activeTab]}
                tab={activeTab}
                accentColor={accentColor}
                onDelete={handleDelete}
                onReorder={handleReorder}
              />
              <AddItem tab={activeTab} accentColor={accentColor} onAdd={handleAdd} />
            </>
          )}
        </div>

        <p className="text-xs text-gray-300 text-center mt-5 select-none">
          Drag to reorder &nbsp;·&nbsp; Ctrl+Z to undo delete
        </p>
      </div>

      {toast && (
        <UndoToast message={toast} onUndo={handleUndo} onDismiss={dismissToast} />
      )}
    </div>
  )
}
