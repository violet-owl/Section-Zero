import { useEffect, useState } from 'react'
import { supabase, type HomeContent } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Megaphone, Lightbulb, Link2, ExternalLink, AlertTriangle } from 'lucide-react'

interface HomeProps {
  searchQuery: string
}

const typeBadge: Record<string, string> = {
  announcement: 'bg-darden-navy text-white dark:bg-darden-navy dark:text-white',
  tip: 'bg-darden-orange/10 text-darden-orange border-darden-orange/20',
  link: 'bg-secondary text-secondary-foreground',
  quicklink: 'bg-secondary text-secondary-foreground',
}

export function Home({ searchQuery }: HomeProps) {
  const [items, setItems] = useState<HomeContent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('home_content')
      .select('*')
      .order('priority')
      .then(({ data }) => {
        setItems(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = items.filter((item) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return item.title.toLowerCase().includes(q) || (item.body ?? '').toLowerCase().includes(q)
  })

  const announcements = filtered.filter((i) => i.type === 'announcement')
  const tips = filtered.filter((i) => i.type === 'tip')
  const quicklinks = filtered.filter((i) => i.type === 'quicklink' || i.type === 'link')

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl bg-darden-navy text-white px-8 py-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)' }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-darden-orange/20 border border-darden-orange/30 px-3 py-1 text-xs text-darden-orange font-medium mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-darden-orange animate-pulse" />
            Live · Class of 2028
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Section Zero</h1>
          <p className="mt-2 text-white/70 text-sm leading-relaxed max-w-lg">
            <i>"Helping you adult before your real Section takes over" </i><br></br>Everything from the WhatsApp mishmash — organized, searchable, and (mostly) accurate.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {/* Announcements */}
          {announcements.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Megaphone className="h-3.5 w-3.5" /> Announcements
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {announcements.map((item) => (
                  <Card key={item.id} className="border-l-4 border-l-darden-navy dark:border-l-darden-orange">
                    <CardHeader className="pb-1 pt-4 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-semibold leading-tight">{item.title}</CardTitle>
                        <Badge className={typeBadge.announcement}>News</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Quick Links */}
          {quicklinks.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Link2 className="h-3.5 w-3.5" /> Quick Links
              </h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {quicklinks.map((item) => (
                  <a
                    key={item.id}
                    href={item.url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-darden-orange/50 hover:bg-accent/30 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.title}</div>
                      {item.body && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.body}</div>}
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-darden-orange transition-colors" />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Tips */}
          {tips.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Lightbulb className="h-3.5 w-3.5" /> Tips from the Group
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {tips.map((item) => (
                  <Card key={item.id} className="border-l-4 border-l-darden-orange">
                    <CardContent className="px-4 py-4">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-3.5 w-3.5 text-darden-orange shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium mb-1">{item.title}</div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {filtered.length === 0 && searchQuery && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <AlertTriangle className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No results for "{searchQuery}" on the Home tab.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
