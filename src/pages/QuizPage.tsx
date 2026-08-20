import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Word } from '../types/word'
import { wordRepository } from '../data/wordRepository'
import { findWordToken, type TokenMatch } from '../lib/findWordToken'
import ProgressBar from '../components/ProgressBar'

type AnswerStatus = 'answering' | 'correct' | 'incorrect'

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
    wordRepository.getDailyWords(50).then((w) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white flex flex-col items-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-md flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-800">빈칸 채우기 퀴즈</h1>
          <p className="text-sm text-slate-400">뜻을 보고 예문 속 빈칸에 알맞은 단어를 써보세요</p>
        </header>

        <ProgressBar current={Math.min(index, total)} total={total} />

        {!isDone && currentWord && blank && (
          <QuizCard
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

interface QuizCardProps {
  word: Word
  blank: TokenMatch
  onAnswered: (isCorrect: boolean) => void
  onNext: () => void
}

function QuizCard({ word, blank, onAnswered, onNext }: QuizCardProps) {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<AnswerStatus>('answering')
  const inputRef = useRef<HTMLInputElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)
  // Enter 키 핸들러(window 리스너)는 상태가 바뀔 때마다 새로 구독되므로,
  // 그 사이 타이핑된 최신 입력값을 놓치지 않도록 ref에도 항상 반영해둔다.
  const latestInput = useRef(input)
  useEffect(() => {
    latestInput.current = input
  }, [input])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    // 접근성을 위해 정답 확인 후 "다음" 버튼으로 포커스를 옮겨준다.
    // (Enter 키 동작 자체는 아래 window keydown 리스너가 포커스 위치와
    // 무관하게 처리하므로, 이 포커스 이동은 시각적 안내용일 뿐이다.)
    if (status !== 'answering') nextButtonRef.current?.focus()
  }, [status])

  const submitAnswer = useCallback(() => {
    const value = latestInput.current.trim()
    if (status !== 'answering' || value.length === 0) return
    const isCorrect = value.toLowerCase() === blank.text.toLowerCase()
    setStatus(isCorrect ? 'correct' : 'incorrect')
    onAnswered(isCorrect)
  }, [status, blank, onAnswered])

  useEffect(() => {
    // 어떤 요소가 포커스를 갖고 있는지와 상관없이 Enter 키가 항상 동작하도록
    // window 레벨에서 감지한다. 정답 확인 전에는 "제출", 확인 후에는 "다음
    // 문제로 이동"에 연결되도록 현재 status를 기준으로 분기한다.
    // capture 단계에 등록하는 이유: disabled 처리된 input 등 다른 요소가
    // 이벤트를 가로막거나 stopPropagation 하더라도 영향을 받지 않도록,
    // 이벤트가 실제 대상에 도달하기 전 가장 바깥(window)에서 먼저 가로챈다.
    function handleWindowKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Enter') return
      e.preventDefault()
      if (status === 'answering') {
        submitAnswer()
      } else {
        onNext()
      }
    }

    window.addEventListener('keydown', handleWindowKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleWindowKeyDown, { capture: true })
  }, [status, onNext, submitAnswer])

  const before = word.example_en.slice(0, blank.start)
  const after = word.example_en.slice(blank.end)

  const inputStateClass =
    status === 'answering'
      ? 'border-slate-300 focus:border-emerald-400'
      : status === 'correct'
        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
        : 'border-rose-400 bg-rose-50 text-rose-600'

  return (
    <div
      className={`rounded-3xl bg-white shadow-lg shadow-slate-200/70 ring-1 ring-slate-100 p-6 sm:p-8 flex flex-col gap-6 ${
        status === 'incorrect' ? 'animate-shake' : status === 'correct' ? 'animate-pop' : ''
      }`}
    >
      <p className="text-center text-lg font-semibold text-slate-700">{word.meaning}</p>

      <p className="text-lg sm:text-xl leading-relaxed text-slate-800 text-center">
        {before}
        <input
          ref={inputRef}
          type="text"
          value={status === 'answering' ? input : blank.text}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== 'answering'}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          size={Math.max(blank.text.length, 4)}
          className={`mx-1 inline-block text-center border-b-2 bg-transparent outline-none font-semibold transition-colors ${inputStateClass}`}
        />
        {after}
      </p>

      {status !== 'answering' && (
        <div
          className={`rounded-2xl p-4 flex flex-col gap-1.5 ${
            status === 'correct' ? 'bg-emerald-50' : 'bg-rose-50'
          }`}
        >
          <p
            className={`text-sm font-semibold ${
              status === 'correct' ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {status === 'correct' ? '정답이에요! 🎉' : `정답은 "${blank.text}" 이에요`}
          </p>
          <p className="text-sm text-slate-600">{word.example_en}</p>
          <p className="text-sm text-slate-500">{word.example_ko}</p>
        </div>
      )}

      {status === 'answering' ? (
        <button
          type="button"
          onClick={submitAnswer}
          disabled={input.trim().length === 0}
          className="py-3 rounded-2xl bg-emerald-500 text-white font-medium shadow-md shadow-emerald-200 active:scale-95 transition hover:bg-emerald-600 disabled:opacity-40 disabled:shadow-none"
        >
          확인
        </button>
      ) : (
        <button
          ref={nextButtonRef}
          type="button"
          onClick={onNext}
          className="py-3 rounded-2xl bg-slate-800 text-white font-medium active:scale-95 transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          다음
        </button>
      )}
    </div>
  )
}
