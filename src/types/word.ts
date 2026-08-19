export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Word {
  id: string
  word: string
  meaning: string
  example_en: string
  example_ko: string
  difficulty: Difficulty
}
