import type { Word } from '../types/word'
import sampleWords from './words.sample.json'
import { getTodaysBatchRange, getCycleStatus, type CycleStatus } from './rotationStore'
import { DAILY_WORD_COUNT } from '../lib/constants'

// 데이터 접근을 이 모듈 뒤로 감춰서, 나중에 실제 API/DB로 교체할 때
// 이 파일만 바꾸면 되도록 분리했다.

/** 한 번 완주하는 데 필요한 단어 수(=하루 학습량 × 완주까지의 일수). */
const BATCH_SIZE = 500

export interface DailySetInfo {
  setNumber: number
  totalSets: number
}

export type { CycleStatus }

export interface WordRepository {
  /**
   * 오늘 날짜 기준으로 순환되는 "오늘의 단어" 세트를 반환한다. 1번째
   * 배치를 완주한 뒤 아직 반복/새 단어를 선택하지 않았다면 빈 배열을
   * 반환한다 — 이때는 getCycleStatus()로 완주 안내 화면을 보여줘야 한다.
   */
  getDailyWords(setSize?: number): Promise<Word[]>
  getDailySetInfo(setSize?: number): Promise<DailySetInfo>
  getCycleStatus(setSize?: number): Promise<CycleStatus>
  getAllWords(): Promise<Word[]>
  getWordById(id: string): Promise<Word | undefined>
}

class LocalJsonWordRepository implements WordRepository {
  private words: Word[] = sampleWords as Word[]

  async getAllWords(): Promise<Word[]> {
    return this.words
  }

  async getDailyWords(setSize = DAILY_WORD_COUNT): Promise<Word[]> {
    const range = getTodaysBatchRange(this.words.length, setSize, BATCH_SIZE)
    if (!range) return []
    return this.words.slice(range.start, range.end)
  }

  async getDailySetInfo(setSize = DAILY_WORD_COUNT): Promise<DailySetInfo> {
    const range = getTodaysBatchRange(this.words.length, setSize, BATCH_SIZE)
    if (!range) return { setNumber: 0, totalSets: 0 }
    return { setNumber: range.setNumber, totalSets: range.totalSets }
  }

  async getCycleStatus(setSize = DAILY_WORD_COUNT): Promise<CycleStatus> {
    return getCycleStatus(this.words.length, setSize, BATCH_SIZE)
  }

  async getWordById(id: string): Promise<Word | undefined> {
    return this.words.find((w) => w.id === id)
  }
}

export const wordRepository: WordRepository = new LocalJsonWordRepository()
