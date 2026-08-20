import { useCallback, useEffect, useRef, useState } from 'react'
import type { Word } from '../types/word'
import type { TokenMatch } from '../lib/findWordToken'
import { diffChars } from '../lib/diffChars'

type AnswerStatus = 'answering' | 'correct' | 'incorrect'

interface BlankFillCardProps {
  word: Word
  blank: TokenMatch
  onAnswered: (isCorrect: boolean) => void
  onNext: () => void
}

export default function BlankFillCard({ word, blank, onAnswered, onNext }: BlankFillCardProps) {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<AnswerStatus>('answering')
  const inputRef = useRef<HTMLInputElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)

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
    const value = input.trim()
    if (status !== 'answering' || value.length === 0) return
    const isCorrect = value.toLowerCase() === blank.text.toLowerCase()
    setStatus(isCorrect ? 'correct' : 'incorrect')
    onAnswered(isCorrect)
  }, [status, input, blank, onAnswered])

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

      {status === 'correct' && (
        <div className="rounded-2xl p-4 flex flex-col gap-1.5 bg-emerald-50">
          <p className="text-sm font-semibold text-emerald-700">정답이에요! 🎉</p>
          <p className="text-sm text-slate-600">{word.example_en}</p>
          <p className="text-sm text-slate-500">{word.example_ko}</p>
        </div>
      )}

      {status === 'incorrect' && (
        <div className="rounded-2xl p-4 flex flex-col gap-3 bg-rose-50">
          <div className="flex flex-col gap-1">
            <AnswerCompareRow label="내가 쓴 답" text={input.trim()} against={blank.text} variant="wrong" />
            <AnswerCompareRow label="정답" text={blank.text} against={input.trim()} variant="correct" />
          </div>
          <div className="h-px bg-rose-100" />
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

interface AnswerCompareRowProps {
  label: string
  text: string
  against: string
  variant: 'wrong' | 'correct'
}

/** 오답일 때 "내가 쓴 답"과 "정답"을 나란히 보여주며, 서로 다른 글자만 하이라이트한다. */
function AnswerCompareRow({ label, text, against, variant }: AnswerCompareRowProps) {
  const { aMatch: matchFlags } = diffChars(text, against)
  const isWrong = variant === 'wrong'

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs font-medium text-slate-400 w-16 shrink-0">{label}</span>
      <span
        className={`font-mono text-base font-bold tracking-wide ${
          isWrong ? 'text-rose-600' : 'text-emerald-700'
        }`}
      >
        {[...text].map((char, i) => (
          <span
            key={i}
            className={
              matchFlags[i]
                ? undefined
                : isWrong
                  ? 'bg-rose-200 rounded-sm'
                  : 'bg-emerald-200 rounded-sm underline decoration-emerald-600 decoration-2'
            }
          >
            {char}
          </span>
        ))}
      </span>
    </div>
  )
}
