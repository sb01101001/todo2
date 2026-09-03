export default function UndoToast({ message, onUndo, onDismiss }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gray-800 text-white text-sm px-4 py-3 rounded-xl shadow-xl whitespace-nowrap">
      <span className="text-gray-300">{message}</span>
      <button
        onClick={onUndo}
        className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
      >
        Undo
      </button>
      <button
        onClick={onDismiss}
        className="text-gray-500 hover:text-gray-300 transition-colors text-base leading-none ml-1"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
