import type { Word } from '../types/word'
import sampleWords from './words.sample.json'
import { getTodaysSetRange } from './rotationStore'

// 데이터 접근을 이 모듈 뒤로 감춰서, 나중에 실제 API/DB로 교체할 때
// 이 파일만 바꾸면 되도록 분리했다.
export interface DailySetInfo {
  setNumber: number
  totalSets: number
}

export interface WordRepository {
  /** 오늘 날짜 기준으로 순환되는 "오늘의 단어" 세트를 반환한다. */
  getDailyWords(setSize?: number): Promise<Word[]>
  getDailySetInfo(setSize?: number): Promise<DailySetInfo>
  getAllWords(): Promise<Word[]>
  getWordById(id: string): Promise<Word | undefined>
}

class LocalJsonWordRepository implements WordRepository {
  private words: Word[] = sampleWords as Word[]

  async getAllWords(): Promise<Word[]> {
    return this.words
  }

  async getDailyWords(setSize = 50): Promise<Word[]> {
    const { start, end } = getTodaysSetRange(this.words.length, setSize)
    return this.words.slice(start, end)
  }

  async getDailySetInfo(setSize = 50): Promise<DailySetInfo> {
    const { setNumber, totalSets } = getTodaysSetRange(this.words.length, setSize)
    return { setNumber, totalSets }
  }

  async getWordById(id: string): Promise<Word | undefined> {
    return this.words.find((w) => w.id === id)
  }
}

export const wordRepository: WordRepository = new LocalJsonWordRepository()
