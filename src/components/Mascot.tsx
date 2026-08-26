interface MascotProps {
  message?: string
  emoji?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass: Record<NonNullable<MascotProps['size']>, string> = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-5xl',
}

export default function Mascot({ message, emoji = '🐥', size = 'md' }: MascotProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className={`${sizeClass[size]} inline-block animate-bounce-slow select-none`}>{emoji}</span>
      {message && (
        <span className="bg-white ring-1 ring-slate-100 shadow-sm rounded-2xl rounded-bl-sm px-3 py-1.5 text-sm font-medium text-slate-600">
          {message}
        </span>
      )}
    </div>
  )
}
