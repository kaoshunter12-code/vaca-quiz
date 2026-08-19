import type { Word } from '../types/word'
import { speak, isTtsSupported } from '../lib/tts'

interface WordCardProps {
  word: Word
}

const difficultyStyle: Record<Word['difficulty'], string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-rose-100 text-rose-700',
}

const difficultyLabel: Record<Word['difficulty'], string> = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
}

export default function WordCard({ word }: WordCardProps) {
  return (
    <div className="relative w-full rounded-3xl bg-white shadow-lg shadow-slate-200/70 ring-1 ring-slate-100 p-6 sm:p-8 flex flex-col gap-6 select-none">
      <div className="flex items-start justify-between">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyStyle[word.difficulty]}`}
        >
          {difficultyLabel[word.difficulty]}
        </span>
        {isTtsSupported() && (
          <button
            type="button"
            onClick={() => speak(word.word)}
            aria-label="발음 듣기"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 active:scale-95 transition"
          >
            🔊
          </button>
        )}
      </div>

      <div className="text-center py-2">
        <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight">
          {word.word}
        </h2>
        <p className="mt-3 text-lg text-slate-500">{word.meaning}</p>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4 sm:p-5 flex flex-col gap-2">
        <p className="text-base sm:text-lg text-slate-800 leading-relaxed">
          {word.example_en}
        </p>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          {word.example_ko}
        </p>
      </div>
    </div>
  )
}
