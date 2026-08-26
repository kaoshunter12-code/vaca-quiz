interface SpinnerProps {
  label?: string
}

export default function Spinner({ label = '불러오는 중...' }: SpinnerProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-400">
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce" />
      </div>
      <p className="text-sm">{label}</p>
    </div>
  )
}
