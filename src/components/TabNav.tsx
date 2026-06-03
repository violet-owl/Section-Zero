import { cn } from '@/lib/utils'
import { Home, Briefcase, Building2, MapPin, ShoppingBag, CheckSquare } from 'lucide-react'

export type TabId = 'home' | 'recruitment' | 'housing' | 'logistics' | 'classifieds' | 'todo'

interface Tab {
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const TABS: Tab[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'recruitment', label: 'Recruitment', icon: Briefcase },
  { id: 'classifieds', label: 'Classifieds', icon: ShoppingBag },
  // { id: 'housing', label: 'Housing', icon: Building2 },
  { id: 'logistics', label: 'Logistics', icon: MapPin },
  { id: 'todo', label: 'My To-Do', icon: CheckSquare }
]

interface TabNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav className="sticky top-14 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-5xl px-2">
        <div className="flex overflow-x-auto scrollbar-hide gap-0">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex min-w-[80px] flex-col items-center gap-1 px-4 py-2.5 text-xs font-medium transition-all whitespace-nowrap border-b-2 shrink-0',
                  isActive
                    ? 'border-darden-orange text-darden-navy dark:text-darden-orange'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-darden-orange' : '')} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
