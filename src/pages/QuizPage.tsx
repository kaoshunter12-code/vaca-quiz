import { useEffect, useMemo, useState } from 'react'
import type { Word } from '../types/word'
import { wordRepository } from '../data/wordRepository'
import { recordReview } from '../data/reviewStore'
import { findWordToken } from '../lib/findWordToken'
import { DAILY_WORD_COUNT } from '../lib/constants'
import ProgressBar from '../components/ProgressBar'
import BlankFillCard from '../components/BlankFillCard'

interface QuizPageProps {
  onGoToLearn?: () => void
}

export default function QuizPage({ onGoToLearn }: QuizPageProps) {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [missedWordIds, setMissedWordIds] = useState<string[]>([])

  useEffect(() => {
    wordRepository.getDailyWords(DAILY_WORD_COUNT).then((w) => {
      setWords(w)
      setLoading(false)
    })
  }, [])

  const total = words.length
  const isDone = total > 0 && index >= total
  const currentWord = !isDone ? words[index] : undefined

  const blank = useMemo(() => {
    if (!currentWord) return null
    return findWordToken(currentWord.word, currentWord.example_en)
  }, [currentWord])

  function handleAnswered(isCorrect: boolean, word: Word) {
    recordReview(word.id, isCorrect)
    if (isCorrect) setCorrectCount((c) => c + 1)
    else setMissedWordIds((ids) => [...ids, word.id])
  }

  function goNext() {
    setIndex((i) => i + 1)
  }

  function restart() {
    setIndex(0)
    setCorrectCount(0)
    setMissedWordIds([])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        불러오는 중...
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white flex flex-col items-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md flex flex-col gap-6">
          <div className="rounded-3xl bg-white shadow-lg shadow-slate-200/70 ring-1 ring-slate-100 p-10 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">🏆</span>
            <h2 className="text-lg font-bold text-slate-800">완주 안내를 먼저 확인해주세요</h2>
            <p className="text-slate-500 text-sm">
              학습 화면에서 다음 단어를 어떻게 이어갈지 선택하면 퀴즈도 다시 시작돼요.
            </p>
            {onGoToLearn && (
              <button
                type="button"
                onClick={onGoToLearn}
                className="mt-2 px-5 py-2.5 rounded-2xl bg-emerald-500 text-white font-medium active:scale-95 transition hover:bg-emerald-600"
              >
                학습 화면으로 가기
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white flex flex-col items-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-md flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-800">빈칸 채우기 퀴즈</h1>
          <p className="text-sm text-slate-400">뜻을 보고 예문 속 빈칸에 알맞은 단어를 써보세요</p>
        </header>

        <ProgressBar current={Math.min(index, total)} total={total} />

        {!isDone && currentWord && blank && (
          <BlankFillCard
            key={currentWord.id}
            word={currentWord}
            blank={blank}
            onAnswered={(isCorrect) => handleAnswered(isCorrect, currentWord)}
            onNext={goNext}
          />
        )}
        {!isDone && currentWord && !blank && (
          <div className="text-center text-slate-400 text-sm">문제를 준비하지 못했어요.</div>
        )}

        {isDone && (
          <div className="rounded-3xl bg-white shadow-lg shadow-slate-200/70 ring-1 ring-slate-100 p-10 flex flex-col items-center gap-4 text-center">
            <span className="text-5xl">{correctCount === total ? '🏆' : '📝'}</span>
            <h2 className="text-xl font-bold text-slate-800">퀴즈 완료!</h2>
            <p className="text-slate-500 text-sm">
              {total}문제 중 <span className="font-semibold text-emerald-600">{correctCount}개</span> 맞혔어요.
            </p>
            {missedWordIds.length > 0 && (
              <p className="text-xs text-slate-400">
                틀린 단어 {missedWordIds.length}개는 복습 큐에서 다시 만나볼 거예요.
              </p>
            )}
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={restart}
                className="px-5 py-2.5 rounded-2xl bg-white ring-1 ring-slate-200 text-slate-600 font-medium active:scale-95 transition"
              >
                다시 풀기
              </button>
              {onGoToLearn && (
                <button
                  type="button"
                  onClick={onGoToLearn}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-500 text-white font-medium active:scale-95 transition hover:bg-emerald-600"
                >
                  단어 학습하기
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
