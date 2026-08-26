import { readJSON, writeJSON } from '../lib/storage'
import { diffInDays, todayString } from '../lib/date'

const FIRST_START_KEY = 'vaca-quiz:first-start-date'
const CYCLE_CHOICE_KEY = 'vaca-quiz:cycle-choice'

/**
 * 사용자가 앱을 처음 사용한 날짜. 저장된 값이 없으면 오늘 날짜로 최초 1회
 * 기록하고 그 값을 돌려준다 (이후로는 계속 같은 값을 유지).
 */
export function getFirstStartDate(): string {
  const stored = readJSON<string | null>(FIRST_START_KEY, null)
  if (stored) return stored

  const today = todayString()
  writeJSON(FIRST_START_KEY, today)
  return today
}

/** 첫 사용일 기준 오늘이 몇 번째 학습일인지 (0부터 시작). 하루 안에는 값이 고정된다. */
export function getDayIndex(): number {
  const firstStartDate = getFirstStartDate()
  return Math.max(0, diffInDays(firstStartDate, todayString()))
}

export type CycleChoice = 'repeat' | 'new-words'

/** 1번째 배치(단어 묶음)를 완주한 뒤 사용자가 고른 선택. 아직 안 골랐으면 null. */
export function getCycleChoice(): CycleChoice | null {
  return readJSON<CycleChoice | null>(CYCLE_CHOICE_KEY, null)
}

export function setCycleChoice(choice: CycleChoice): void {
  writeJSON(CYCLE_CHOICE_KEY, choice)
}

export interface BatchRange {
  start: number
  end: number
  setNumber: number
  totalSets: number
}

export interface CycleStatus {
  /** 1번째 배치를 다 마쳤고, 다음 단어를 반복/새 단어 중 아직 선택하지 않은 상태 */
  awaitingChoice: boolean
  daysPerBatch: number
  hasSecondBatch: boolean
}

/**
 * 전체 단어를 batchSize개 단위(1회 완주 분량)로 나눠 오늘 보여줄 세트를
 * 계산한다. 1번째 배치를 다 마치면(daysPerBatch일 경과) 사용자가 "반복"
 * 또는 "새 단어로 계속"을 선택할 때까지 null을 반환해 화면 쪽에서 완주
 * 안내를 보여주도록 한다. "새 단어"를 고르면 2번째 배치(batchSize~)를
 * 순환하고, 그 배치도 다 돌면 처음부터 다시 반복한다.
 */
export function getTodaysBatchRange(
  totalWords: number,
  setSize: number,
  batchSize: number,
): BatchRange | null {
  const daysPerBatch = Math.max(1, Math.floor(batchSize / setSize))
  const dayIndex = getDayIndex()
  const hasSecondBatch = totalWords >= batchSize * 2

  if (dayIndex < daysPerBatch) {
    const setIndex = dayIndex % daysPerBatch
    return {
      start: setIndex * setSize,
      end: setIndex * setSize + setSize,
      setNumber: setIndex + 1,
      totalSets: daysPerBatch,
    }
  }

  const choice = hasSecondBatch ? getCycleChoice() : 'repeat'
  if (choice === null) return null

  if (choice === 'new-words') {
    const dayInBatch2 = (dayIndex - daysPerBatch) % daysPerBatch
    const offset = batchSize + dayInBatch2 * setSize
    return {
      start: offset,
      end: offset + setSize,
      setNumber: dayInBatch2 + 1,
      totalSets: daysPerBatch,
    }
  }

  const setIndex = dayIndex % daysPerBatch
  return {
    start: setIndex * setSize,
    end: setIndex * setSize + setSize,
    setNumber: setIndex + 1,
    totalSets: daysPerBatch,
  }
}

export function getCycleStatus(totalWords: number, setSize: number, batchSize: number): CycleStatus {
  const daysPerBatch = Math.max(1, Math.floor(batchSize / setSize))
  const dayIndex = getDayIndex()
  const hasSecondBatch = totalWords >= batchSize * 2
  const awaitingChoice = dayIndex >= daysPerBatch && hasSecondBatch && getCycleChoice() === null
  return { awaitingChoice, daysPerBatch, hasSecondBatch }
}
