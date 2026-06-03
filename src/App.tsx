import { useState } from 'react'
import { Header } from '@/components/Header'
import { TabNav, type TabId } from '@/components/TabNav'
import { Footer } from '@/components/Footer'
import { Home } from '@/views/Home'
import { RecruitmentView } from '@/views/Recruitment'
import { HousingView } from '@/views/Housing'
import { LogisticsView } from '@/views/Logistics'
import { ClassifiedsView } from '@/views/Classifieds'
import { PersonalTodoView } from '@/views/PersonalTodo'

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-svh bg-background text-foreground flex flex-col">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">
        {activeTab === 'home' && <Home searchQuery={searchQuery} />}
        {activeTab === 'recruitment' && <RecruitmentView searchQuery={searchQuery} />}
        {activeTab === 'housing' && <HousingView searchQuery={searchQuery} />}
        {activeTab === 'logistics' && <LogisticsView searchQuery={searchQuery} />}
        {activeTab === 'classifieds' && <ClassifiedsView searchQuery={searchQuery} />}
        {activeTab === 'todo' && <PersonalTodoView searchQuery={searchQuery} />}
      </main>
      <Footer />
    </div>
  )
}

export default App
