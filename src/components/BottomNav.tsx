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
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-white/90 backdrop-blur border-t border-slate-100">
      <div className="max-w-md mx-auto grid" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((item) => {
          const isActive = item.key === active
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition ${
                isActive ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <span className={`text-lg transition ${isActive ? 'scale-110' : ''}`}>
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
