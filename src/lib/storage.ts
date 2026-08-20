// localStorage 접근을 한 곳에 모아, 추후 백엔드 저장소로 교체할 때
// 이 모듈만 바꾸면 되도록 분리했다.
export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 프라이빗 모드 등 localStorage를 쓸 수 없는 환경은 조용히 무시한다.
  }
}
