import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripIcon, TrashIcon } from './icons'

export default function Item({ item, tab, accentColor, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-4 py-3 group hover:bg-gray-50/70 transition-colors"
    >
      {/* Drag handle */}
      <span
        {...listeners}
        {...attributes}
        className="text-gray-200 hover:text-gray-400 cursor-grab active:cursor-grabbing transition-colors flex-shrink-0 touch-none"
        tabIndex={-1}
      >
        <GripIcon />
      </span>

      {/* Bullet */}
      <span
        className="flex-shrink-0 w-[6px] h-[6px] rounded-full"
        style={{ backgroundColor: accentColor }}
      />

      {/* Text */}
      <span className="flex-1 text-sm leading-snug text-gray-700">
        {item.text}
      </span>

      {/* Delete */}
      <button
        onClick={() => onDelete(item.id)}
        className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
        aria-label="Delete item"
      >
        <TrashIcon />
      </button>
    </li>
  )
}
