export function todayString(): string {
  return toDateString(new Date())
}

export function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return toDateString(d)
}

export function diffInDays(fromDateStr: string, toDateStr: string): number {
  const diffMs = new Date(toDateStr).getTime() - new Date(fromDateStr).getTime()
  return Math.round(diffMs / 86_400_000)
}
