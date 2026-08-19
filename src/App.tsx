import { useState } from 'react'
import LearnPage from './pages/LearnPage'
import QuizPage from './pages/QuizPage'
import BottomNav from './components/BottomNav'

type Tab = 'learn' | 'quiz'

function App() {
  const [tab, setTab] = useState<Tab>('learn')

  return (
    <div className="pb-16">
      {tab === 'learn' && <LearnPage onGoToQuiz={() => setTab('quiz')} />}
      {tab === 'quiz' && <QuizPage onGoToLearn={() => setTab('learn')} />}

      <BottomNav
        items={[
          { key: 'learn', label: '학습', icon: '📖' },
          { key: 'quiz', label: '퀴즈', icon: '✏️' },
        ]}
        active={tab}
        onChange={setTab}
      />
    </div>
  )
}

export default App
