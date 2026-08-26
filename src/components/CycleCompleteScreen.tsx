import type { CycleChoice } from '../data/rotationStore'
import Mascot from './Mascot'

interface CycleCompleteScreenProps {
  daysPerBatch: number
  hasSecondBatch: boolean
  onChoose: (choice: CycleChoice) => void
}

export default function CycleCompleteScreen({
  daysPerBatch,
  hasSecondBatch,
  onChoose,
}: CycleCompleteScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white flex flex-col items-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="rounded-3xl bg-white shadow-lg shadow-slate-200/70 ring-1 ring-slate-100 p-8 sm:p-10 flex flex-col items-center gap-4 text-center">
          <span className="text-6xl">🏆</span>
          <h1 className="text-2xl font-bold text-slate-800">축하합니다!</h1>
          <p className="text-slate-600">
            {daysPerBatch}일 동안 꾸준히 학습해서
            <br />
            전체 과정을 완주했어요! 🎉
          </p>

          <Mascot message="정말 대단해요! 이 기세로 계속 가볼까요?" />

          <div className="w-full h-px bg-slate-100 my-2" />

          <p className="text-sm font-semibold text-slate-700">이제부터 어떻게 계속할까요?</p>

          <div className="w-full flex flex-col gap-3">
            <button
              type="button"
              onClick={() => onChoose('repeat')}
              className="w-full py-3.5 rounded-2xl bg-white ring-2 ring-emerald-200 text-emerald-700 font-medium active:scale-95 transition hover:bg-emerald-50 flex flex-col items-center gap-0.5"
            >
              <span>처음부터 다시 학습하기</span>
              <span className="text-xs font-normal text-emerald-500">
                같은 단어를 반복하며 확실히 내 것으로
              </span>
            </button>

            <button
              type="button"
              onClick={() => hasSecondBatch && onChoose('new-words')}
              disabled={!hasSecondBatch}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-medium shadow-md shadow-emerald-200 active:scale-95 transition hover:bg-emerald-600 disabled:opacity-40 disabled:shadow-none flex flex-col items-center gap-0.5"
            >
              <span>새로운 단어로 계속하기</span>
              <span className="text-xs font-normal text-emerald-50">
                {hasSecondBatch ? '새 단어로 다시 도전해봐요' : '새 단어 준비 중이에요'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
