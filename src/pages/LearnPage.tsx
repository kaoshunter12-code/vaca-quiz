import { useEffect, useMemo, useRef, useState } from 'react'
import type { Word } from '../types/word'
import { wordRepository, type DailySetInfo, type CycleStatus } from '../data/wordRepository'
import { setCycleChoice, type CycleChoice } from '../data/rotationStore'
import { recordDailyCompletion } from '../data/statsStore'
import { DAILY_WORD_COUNT } from '../lib/constants'
import WordCard from '../components/WordCard'
import ProgressBar from '../components/ProgressBar'
import CycleCompleteScreen from '../components/CycleCompleteScreen'
import Spinner from '../components/Spinner'
import Mascot from '../components/Mascot'

const ENCOURAGEMENTS = [
  '좋아요! 이 속도 유지해요 🐣',
  '벌써 절반이에요, 대단해요! 🎉',
  '조금만 더 힘내요! 💪',
  '거의 다 왔어요! ✨',
]

interface LearnPageProps {
  onGoToQuiz?: () => void
}

interface DailyState {
  cycleStatus: CycleStatus
  words: Word[]
  setInfo: DailySetInfo | null
}

export default function LearnPage({ onGoToQuiz }: LearnPageProps) {
  const [daily, setDaily] = useState<DailyState | null>(null)
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  async function fetchDailyState(): Promise<DailyState> {
    const status = await wordRepository.getCycleStatus(DAILY_WORD_COUNT)
    if (status.awaitingChoice) {
      return { cycleStatus: status, words: [], setInfo: null }
    }
    const [w, info] = await Promise.all([
      wordRepository.getDailyWords(DAILY_WORD_COUNT),
      wordRepository.getDailySetInfo(DAILY_WORD_COUNT),
    ])
    return { cycleStatus: status, words: w, setInfo: info }
  }

  async function loadToday() {
    setDaily(await fetchDailyState())
  }

  useEffect(() => {
    loadToday()
  }, [])

  function handleChooseCycle(choice: CycleChoice) {
    setCycleChoice(choice)
    setIndex(0)
    setDaily(null)
    loadToday()
  }

  const loading = daily === null
  const words = daily?.words ?? []
  const setInfo = daily?.setInfo ?? null
  const cycleStatus = daily?.cycleStatus ?? null
  const total = words.length
  const isDone = total > 0 && index >= total
  const currentWord = !isDone ? words[index] : undefined

  useEffect(() => {
    if (isDone) recordDailyCompletion(total)
  }, [isDone, total])

  const encouragement = useMemo(() => {
    if (total === 0) return ''
    const progress = index / total
    if (progress >= 0.75) return ENCOURAGEMENTS[3]
    if (progress >= 0.5) return ENCOURAGEMENTS[1]
    if (progress >= 0.25) return ENCOURAGEMENTS[2]
    return ENCOURAGEMENTS[0]
  }, [index, total])

  function goNext() {
    setIndex((i) => Math.min(i + 1, total))
  }

  function goPrev() {
    setIndex((i) => Math.max(i - 1, 0))
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    setDragX(e.touches[0].clientX - touchStartX.current)
  }

  function handleTouchEnd() {
    if (Math.abs(dragX) > 80) {
      if (dragX < 0) goNext()
      else goPrev()
    }
    touchStartX.current = null
    setIsDragging(false)
    setDragX(0)
  }

  if (loading) {
    return <Spinner />
  }

  if (cycleStatus?.awaitingChoice) {
    return (
      <CycleCompleteScreen
        daysPerBatch={cycleStatus.daysPerBatch}
        hasSecondBatch={cycleStatus.hasSecondBatch}
        onChoose={handleChooseCycle}
      />
    )
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-emerald-50 via-white to-white flex flex-col items-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-md flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">오늘의 단어</h1>
            {setInfo && (
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {setInfo.setNumber}일차 세트 ({setInfo.setNumber}/{setInfo.totalSets})
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">
            예문과 함께 하루 {DAILY_WORD_COUNT}개씩, 하나씩 익혀봐요
          </p>
        </header>

        <ProgressBar current={Math.min(index, total)} total={total} />

        {!isDone && currentWord ? (
          <>
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                transform: `translateX(${dragX}px) rotate(${dragX / 30}deg)`,
                transition: isDragging ? 'none' : 'transform 0.25s ease-out',
              }}
            >
              <WordCard key={currentWord.id} word={currentWord} />
            </div>

            <div className="-mt-2">
              <Mascot message={encouragement} />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={index === 0}
                className="flex-1 py-3 rounded-2xl bg-white ring-1 ring-slate-200 text-slate-600 font-medium disabled:opacity-40 active:scale-95 transition"
              >
                이전
              </button>
              <button
                type="button"
                onClick={goNext}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white font-medium shadow-md shadow-emerald-200 active:scale-95 transition hover:bg-emerald-600"
              >
                {index === total - 1 ? '완료' : '다음'}
              </button>
            </div>
            <p className="text-center text-xs text-slate-300">
              카드를 좌우로 스와이프해도 이동할 수 있어요
            </p>
          </>
        ) : (
          <div className="rounded-3xl bg-white shadow-lg shadow-slate-200/70 ring-1 ring-slate-100 p-10 flex flex-col items-center gap-4 text-center">
            <span className="text-5xl">🎉</span>
            <h2 className="text-xl font-bold text-slate-800">오늘의 단어 학습 완료!</h2>
            <p className="text-slate-500 text-sm">
              {total}개의 단어를 모두 확인했어요. 잠시 후 빈칸 채우기 퀴즈로 복습해봐요.
            </p>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIndex(0)}
                className="px-5 py-2.5 rounded-2xl bg-white ring-1 ring-slate-200 text-slate-600 font-medium active:scale-95 transition"
              >
                다시 보기
              </button>
              {onGoToQuiz && (
                <button
                  type="button"
                  onClick={onGoToQuiz}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-500 text-white font-medium active:scale-95 transition hover:bg-emerald-600"
                >
                  퀴즈 풀러 가기
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
