import { readJSON, writeJSON } from '../lib/storage'
import { addDays, todayString } from '../lib/date'

/** SM-2 알고리즘을 단순화한 간격 반복 스케줄. */
export interface ReviewState {
  wordId: string
  repetitions: number
  interval: number // 다음 복습까지의 간격(일)
  easeFactor: number
  dueDate: string // YYYY-MM-DD, 이 날짜 이후 복습 큐에 표시됨
}

const STORAGE_KEY = 'vaca-quiz:review'
const DEFAULT_EASE_FACTOR = 2.5
const MIN_EASE_FACTOR = 1.3

type ReviewMap = Record<string, ReviewState>

function getAll(): ReviewMap {
  return readJSON(STORAGE_KEY, {} as ReviewMap)
}

function save(map: ReviewMap): void {
  writeJSON(STORAGE_KEY, map)
}

export function getReviewState(wordId: string): ReviewState | undefined {
  return getAll()[wordId]
}

/**
 * 퀴즈에서 정답/오답을 확인할 때마다 호출한다. SM-2를 단순화해:
 * - 맞히면 반복 횟수에 따라 간격을 늘리고(1일 → 6일 → 이후 interval*easeFactor),
 *   easeFactor를 소폭 올린다.
 * - 틀리면 반복 횟수를 0으로 리셋하고 오늘 다시 복습 큐에 뜨도록 하며,
 *   easeFactor를 낮춰 다음에 더 자주 보이게 한다.
 */
export function recordReview(wordId: string, isCorrect: boolean): ReviewState {
  const map = getAll()
  const prev = map[wordId] ?? {
    wordId,
    repetitions: 0,
    interval: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    dueDate: todayString(),
  }

  const next: ReviewState = isCorrect
    ? computeCorrect(prev)
    : {
        wordId,
        repetitions: 0,
        interval: 1,
        easeFactor: Math.max(MIN_EASE_FACTOR, prev.easeFactor - 0.2),
        dueDate: todayString(),
      }

  map[wordId] = next
  save(map)
  return next
}

function computeCorrect(prev: ReviewState): ReviewState {
  const repetitions = prev.repetitions + 1
  const interval =
    repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.round(prev.interval * prev.easeFactor)
  const easeFactor = Math.max(MIN_EASE_FACTOR, prev.easeFactor + 0.1)

  return {
    wordId: prev.wordId,
    repetitions,
    interval,
    easeFactor,
    dueDate: addDays(todayString(), interval),
  }
}

/** 이전에 한 번이라도 퀴즈에서 만났고, 오늘 기준 복습이 예정된 단어 id 목록. */
export function getDueWordIds(): string[] {
  const today = todayString()
  return Object.values(getAll())
    .filter((state) => state.dueDate <= today)
    .map((state) => state.wordId)
}
