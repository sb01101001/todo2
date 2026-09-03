const TABS = [
  { id: 'work', label: 'Work', color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'shopping', label: 'Shopping', color: '#10B981', bg: '#ECFDF5' },
  { id: 'personal', label: 'Personal', color: '#8B5CF6', bg: '#F5F3FF' },
]

export default function TabNav({ activeTab, onTabChange }) {
  return (
    <div className="flex gap-2">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-150 select-none"
            style={
              isActive
                ? { backgroundColor: tab.bg, color: tab.color }
                : { color: '#9CA3AF', backgroundColor: 'transparent' }
            }
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
