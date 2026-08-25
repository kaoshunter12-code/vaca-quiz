import { useState } from 'react'
import { getStats, isTodayCompleted } from '../data/statsStore'
import { DAILY_WORD_COUNT } from '../lib/constants'

interface StatsPageProps {
  onGoToLearn?: () => void
}

export default function StatsPage({ onGoToLearn }: StatsPageProps) {
  // App.tsx가 탭 전환 시 이 컴포넌트를 매번 새로 마운트하므로,
  // 초기 상태를 즉시 읽어와도 화면을 볼 때마다 최신 값이 반영된다.
  const [stats] = useState(() => getStats())

  const todayDone = isTodayCompleted(stats)

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white flex flex-col items-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-md flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-800">나의 학습 현황</h1>
          <p className="text-sm text-slate-400">꾸준함이 실력을 만들어요</p>
        </header>

        <div
          className={`rounded-3xl p-6 flex items-center gap-4 shadow-lg shadow-slate-200/70 ring-1 ${
            todayDone
              ? 'bg-emerald-50 ring-emerald-100'
              : 'bg-white ring-slate-100'
          }`}
        >
          <span className="text-4xl">{todayDone ? '✅' : '📖'}</span>
          <div className="flex-1">
            <p className={`font-bold ${todayDone ? 'text-emerald-700' : 'text-slate-800'}`}>
              {todayDone ? '오늘 학습 완료!' : '아직 오늘 학습 전이에요'}
            </p>
            <p className="text-sm text-slate-500">
              {todayDone ? '내일도 이 기세로 이어가요' : `오늘의 단어 ${DAILY_WORD_COUNT}개를 만나보세요`}
            </p>
          </div>
          {!todayDone && onGoToLearn && (
            <button
              type="button"
              onClick={onGoToLearn}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium active:scale-95 transition hover:bg-emerald-600 shrink-0"
            >
              학습하기
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white shadow-lg shadow-slate-200/70 ring-1 ring-slate-100 p-5 flex flex-col items-center gap-1 text-center">
            <span className="text-3xl">🔥</span>
            <p className="text-2xl font-bold text-slate-800">{stats.streak}일</p>
            <p className="text-xs text-slate-400">연속 학습</p>
          </div>
          <div className="rounded-3xl bg-white shadow-lg shadow-slate-200/70 ring-1 ring-slate-100 p-5 flex flex-col items-center gap-1 text-center">
            <span className="text-3xl">📚</span>
            <p className="text-2xl font-bold text-slate-800">{stats.totalWordsLearned}개</p>
            <p className="text-xs text-slate-400">누적 학습 단어</p>
          </div>
        </div>

        <p className="text-center text-sm text-violet-500 font-medium">
          {stats.streak >= 3
            ? `${stats.streak}일 연속 학습 중이에요, 정말 대단해요! 🎉`
            : '작은 습관이 쌓여 큰 실력이 돼요 🌱'}
        </p>
      </div>
    </div>
  )
}
