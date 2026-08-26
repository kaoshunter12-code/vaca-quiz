import { useState } from 'react'
import LearnPage from './pages/LearnPage'
import QuizPage from './pages/QuizPage'
import ReviewPage from './pages/ReviewPage'
import StatsPage from './pages/StatsPage'
import BottomNav from './components/BottomNav'

type Tab = 'learn' | 'quiz' | 'review' | 'stats'

function App() {
  const [tab, setTab] = useState<Tab>('learn')

  return (
    <div className="min-h-screen w-full bg-slate-100 flex justify-center sm:items-center sm:py-10 sm:px-4">
      <div className="relative flex flex-col w-full min-h-screen bg-white overflow-hidden sm:w-[390px] sm:h-[844px] sm:min-h-0 sm:rounded-[2.75rem] sm:shadow-2xl sm:ring-[14px] sm:ring-slate-900">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div key={tab} className="h-full animate-tab-fade">
            {tab === 'learn' && <LearnPage onGoToQuiz={() => setTab('quiz')} />}
            {tab === 'quiz' && <QuizPage onGoToLearn={() => setTab('learn')} />}
            {tab === 'review' && <ReviewPage onGoToLearn={() => setTab('learn')} />}
            {tab === 'stats' && <StatsPage onGoToLearn={() => setTab('learn')} />}
          </div>
        </div>

        <BottomNav
          items={[
            { key: 'learn', label: '학습', icon: '📖' },
            { key: 'quiz', label: '퀴즈', icon: '✏️' },
            { key: 'review', label: '복습', icon: '🔁' },
            { key: 'stats', label: '통계', icon: '📊' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>
    </div>
  )
}

export default App
