import { useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Home } from '@/views/Home'
import { RecruitmentView } from '@/views/Recruitment'
import { HousingView } from '@/views/Housing'
import { LogisticsView } from '@/views/Logistics'
import { ClassifiedsView } from '@/views/Classifieds'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

// Union of all drilldown section ids — extend here to add new navigable sections
type SectionId = 'home' | 'recruitment' | 'classifieds' | 'logistics' | 'housing'

export function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('home')
  const [searchQuery, setSearchQuery] = useState('')

  const isHome = activeSection === 'home'

  return (
    <div className="min-h-svh bg-background text-foreground flex flex-col">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">
        {isHome ? (
          <Home
            searchQuery={searchQuery}
            onNavigate={(id) => setActiveSection(id as SectionId)}
          />
        ) : (
          <>
            <div className="mb-5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveSection('home')}
                className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
            {activeSection === 'recruitment' && <RecruitmentView searchQuery={searchQuery} />}
            {activeSection === 'housing' && <HousingView searchQuery={searchQuery} />}
            {activeSection === 'logistics' && <LogisticsView searchQuery={searchQuery} />}
            {activeSection === 'classifieds' && <ClassifiedsView searchQuery={searchQuery} />}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
