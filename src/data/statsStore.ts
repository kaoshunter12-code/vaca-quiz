import { readJSON, writeJSON } from '../lib/storage'
import { diffInDays, todayString } from '../lib/date'

export interface StudyStats {
  totalWordsLearned: number
  streak: number
  lastStudyDate: string | null
}

const STORAGE_KEY = 'vaca-quiz:stats'
const DEFAULT_STATS: StudyStats = {
  totalWordsLearned: 0,
  streak: 0,
  lastStudyDate: null,
}

function isYesterday(dateStr: string, today: string): boolean {
  return diffInDays(dateStr, today) === 1
}

export function getStats(): StudyStats {
  return readJSON(STORAGE_KEY, DEFAULT_STATS)
}

export function isTodayCompleted(stats: StudyStats = getStats()): boolean {
  return stats.lastStudyDate === todayString()
}

/** 오늘의 단어 학습을 완료했을 때 호출한다. 같은 날 여러 번 호출해도 한 번만 반영된다. */
export function recordDailyCompletion(wordCount: number): StudyStats {
  const stats = getStats()
  const today = todayString()

  if (stats.lastStudyDate === today) {
    return stats
  }

  const nextStreak =
    stats.lastStudyDate && isYesterday(stats.lastStudyDate, today) ? stats.streak + 1 : 1

  const next: StudyStats = {
    totalWordsLearned: stats.totalWordsLearned + wordCount,
    streak: nextStreak,
    lastStudyDate: today,
  }
  writeJSON(STORAGE_KEY, next)
  return next
}
