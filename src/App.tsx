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
    <div className="pb-16">
      <div key={tab} className="animate-tab-fade">
        {tab === 'learn' && <LearnPage onGoToQuiz={() => setTab('quiz')} />}
        {tab === 'quiz' && <QuizPage onGoToLearn={() => setTab('learn')} />}
        {tab === 'review' && <ReviewPage onGoToLearn={() => setTab('learn')} />}
        {tab === 'stats' && <StatsPage onGoToLearn={() => setTab('learn')} />}
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
  )
}

export default App
