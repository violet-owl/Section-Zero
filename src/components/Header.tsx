import { Search, GraduationCap } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (q: string) => void
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-darden-navy shadow-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-darden-orange">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-white tracking-wide">Section Zero</div>
            <div className="text-[11px] text-white/60 leading-none">The Pre-Matriculation Bunker</div>
          </div>
        </div>
        <div className="flex-1 relative max-w-sm ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search everything..."
            className="h-8 pl-8 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-darden-orange focus-visible:bg-white/15"
          />
        </div>
      </div>
    </header>
  )
}
