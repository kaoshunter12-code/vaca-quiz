import { readJSON, writeJSON } from '../lib/storage'
import { diffInDays, todayString } from '../lib/date'

const STORAGE_KEY = 'vaca-quiz:first-start-date'

/**
 * 사용자가 앱을 처음 사용한 날짜. 저장된 값이 없으면 오늘 날짜로 최초 1회
 * 기록하고 그 값을 돌려준다 (이후로는 계속 같은 값을 유지).
 */
export function getFirstStartDate(): string {
  const stored = readJSON<string | null>(STORAGE_KEY, null)
  if (stored) return stored

  const today = todayString()
  writeJSON(STORAGE_KEY, today)
  return today
}

/** 첫 사용일 기준 오늘이 몇 번째 학습일인지 (0부터 시작). 하루 안에는 값이 고정된다. */
export function getDayIndex(): number {
  const firstStartDate = getFirstStartDate()
  return Math.max(0, diffInDays(firstStartDate, todayString()))
}

/**
 * 전체 단어 개수와 세트 크기가 주어졌을 때, 오늘 보여줄 세트의 시작
 * 인덱스를 계산한다. 전체 단어를 다 쓰면 처음 세트로 순환한다.
 */
export function getTodaysSetRange(
  totalWords: number,
  setSize: number,
): { start: number; end: number; setNumber: number; totalSets: number } {
  const totalSets = Math.max(1, Math.floor(totalWords / setSize))
  const dayIndex = getDayIndex()
  const setIndex = dayIndex % totalSets
  const start = setIndex * setSize
  return { start, end: start + setSize, setNumber: setIndex + 1, totalSets }
}
