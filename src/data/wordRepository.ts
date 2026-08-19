import type { Word } from '../types/word'
import sampleWords from './words.sample.json'

// 데이터 접근을 이 모듈 뒤로 감춰서, 나중에 실제 API/DB로 교체할 때
// 이 파일만 바꾸면 되도록 분리했다.
export interface WordRepository {
  getDailyWords(count?: number): Promise<Word[]>
  getAllWords(): Promise<Word[]>
  getWordById(id: string): Promise<Word | undefined>
}

class LocalJsonWordRepository implements WordRepository {
  private words: Word[] = sampleWords as Word[]

  async getAllWords(): Promise<Word[]> {
    return this.words
  }

  async getDailyWords(count = 50): Promise<Word[]> {
    return this.words.slice(0, count)
  }

  async getWordById(id: string): Promise<Word | undefined> {
    return this.words.find((w) => w.id === id)
  }
}

export const wordRepository: WordRepository = new LocalJsonWordRepository()
