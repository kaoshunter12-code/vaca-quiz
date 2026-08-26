export interface NavItem<T extends string> {
  key: T
  label: string
  icon: string
}

interface BottomNavProps<T extends string> {
  items: NavItem<T>[]
  active: T
  onChange: (key: T) => void
}

export default function BottomNav<T extends string>({
  items,
  active,
  onChange,
}: BottomNavProps<T>) {
  const activeIndex = Math.max(0, items.findIndex((item) => item.key === active))

  return (
    <nav className="shrink-0 bg-white border-t border-slate-100">
      <div
        className="relative grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
      >
        <span
          aria-hidden
          className="absolute top-1.5 bottom-1.5 rounded-2xl bg-emerald-50 transition-transform duration-300 ease-out"
          style={{
            width: `${100 / items.length}%`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {items.map((item) => {
          const isActive = item.key === active
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={`relative z-10 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                isActive ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <span
                className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
