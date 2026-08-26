import { useEffect, useMemo, useState } from 'react'
import type { Word } from '../types/word'
import { wordRepository } from '../data/wordRepository'
import { getDueWordIds, recordReview } from '../data/reviewStore'
import { findWordToken } from '../lib/findWordToken'
import { DAILY_WORD_COUNT } from '../lib/constants'
import ProgressBar from '../components/ProgressBar'
import BlankFillCard from '../components/BlankFillCard'
import Spinner from '../components/Spinner'

interface ReviewPageProps {
  onGoToLearn?: () => void
}

export default function ReviewPage({ onGoToLearn }: ReviewPageProps) {
  const [dueWords, setDueWords] = useState<Word[] | null>(null)
  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  useEffect(() => {
    loadDueWords()
  }, [])

  async function loadDueWords() {
    // 복습은 "오늘 학습 세트에서 틀린 단어 다시 풀기"로 한정한다. 날짜가
    // 바뀌어 세트가 로테이션되면 어제 이전에 틀린 단어는 더 이상 뜨지
    // 않고, 복습 화면도 자연스럽게 매일 새로 시작된다. (SM-2 스케줄
    // 자체는 reviewStore에 계속 기록되어, 추후 장기 복습 기능에 재사용할
    // 수 있다.)
    const [todaysWords, dueIds] = await Promise.all([
      wordRepository.getDailyWords(DAILY_WORD_COUNT),
      Promise.resolve(getDueWordIds()),
    ])
    const dueIdSet = new Set(dueIds)
    setDueWords(todaysWords.filter((w) => dueIdSet.has(w.id)))
  }

  const total = dueWords?.length ?? 0
  const isDone = dueWords !== null && total > 0 && index >= total
  const currentWord = dueWords && !isDone ? dueWords[index] : undefined

  const blank = useMemo(() => {
    if (!currentWord) return null
    return findWordToken(currentWord.word, currentWord.example_en)
  }, [currentWord])

  function handleAnswered(isCorrect: boolean, word: Word) {
    recordReview(word.id, isCorrect)
    if (isCorrect) setCorrectCount((c) => c + 1)
  }

  function goNext() {
    setIndex((i) => i + 1)
  }

  async function restart() {
    setIndex(0)
    setCorrectCount(0)
    setDueWords(null)
    await loadDueWords()
  }

  if (dueWords === null) {
    return <Spinner />
  }

  if (total === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white flex flex-col items-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md flex flex-col gap-6">
          <header className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-slate-800">복습</h1>
            <p className="text-sm text-slate-400">오늘 퀴즈에서 틀린 단어를 다시 풀어봐요</p>
          </header>
          <div className="rounded-3xl bg-white shadow-lg shadow-slate-200/70 ring-1 ring-slate-100 p-10 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">🌱</span>
            <h2 className="text-lg font-bold text-slate-800">지금은 복습할 단어가 없어요</h2>
            <p className="text-slate-500 text-sm">
              오늘의 퀴즈를 다 풀고 틀린 단어가 있으면 여기에 나타나요.
            </p>
            {onGoToLearn && (
              <button
                type="button"
                onClick={onGoToLearn}
                className="mt-2 px-5 py-2.5 rounded-2xl bg-emerald-500 text-white font-medium active:scale-95 transition hover:bg-emerald-600"
              >
                오늘의 단어 학습하러 가기
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white flex flex-col items-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-md flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-800">복습</h1>
          <p className="text-sm text-slate-400">오늘 퀴즈에서 틀린 단어를 다시 풀어봐요</p>
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

        {isDone && (
          <div className="rounded-3xl bg-white shadow-lg shadow-slate-200/70 ring-1 ring-slate-100 p-10 flex flex-col items-center gap-4 text-center">
            <span className="text-5xl">{correctCount === total ? '🌟' : '🔁'}</span>
            <h2 className="text-xl font-bold text-slate-800">복습 완료!</h2>
            <p className="text-slate-500 text-sm">
              {total}개 중 <span className="font-semibold text-amber-600">{correctCount}개</span> 맞혔어요.
              여전히 틀린 단어는 아래에서 다시 확인할 수 있어요.
            </p>
            <button
              type="button"
              onClick={restart}
              className="mt-2 px-5 py-2.5 rounded-2xl bg-amber-500 text-white font-medium active:scale-95 transition hover:bg-amber-600"
            >
              다시 확인하기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
