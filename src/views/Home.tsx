import { useEffect, useState } from 'react'
import { supabase, type HomeContent } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PersonalTodoView } from '@/views/PersonalTodo'
import {
  Briefcase,
  ShoppingBag,
  MapPin,
  Link2,
  ExternalLink,
  CheckSquare,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Tile config — add new drilldown sections here
// ---------------------------------------------------------------------------
interface TileConfig {
  id: string
  label: string
  description: string
  icon: LucideIcon
  accent: string        // Tailwind bg class for the icon bubble
  iconColor: string     // Tailwind text class for the icon
}

const TILE_CONFIG: TileConfig[] = [
  {
    id: 'recruitment',
    label: 'Recruitment',
    description: 'Consulting, IB, Tech, and general resources',
    icon: Briefcase,
    accent: 'bg-darden-navy/10 dark:bg-darden-navy/30',
    iconColor: 'text-darden-navy dark:text-white',
  },
  {
    id: 'classifieds',
    label: 'Classifieds',
    description: 'Housing, furniture, vehicles, and more',
    icon: ShoppingBag,
    accent: 'bg-darden-orange/10',
    iconColor: 'text-darden-orange',
  },
  {
    id: 'logistics',
    label: 'Logistics',
    description: 'Visa, transit, banking, and pre-arrival',
    icon: MapPin,
    accent: 'bg-darden-navy/10 dark:bg-darden-navy/30',
    iconColor: 'text-darden-navy dark:text-white',
  },
]

// ---------------------------------------------------------------------------
// Bottom-tabs config — add new home tabs here
// ---------------------------------------------------------------------------
interface HomeTabConfig {
  id: string
  label: string
  icon: LucideIcon
}

const HOME_TABS_CONFIG: HomeTabConfig[] = [
  { id: 'quicklinks', label: 'Quick Links', icon: Link2 },
  { id: 'todo',       label: 'My To-Do List', icon: CheckSquare },
]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface HomeProps {
  searchQuery: string
  onNavigate: (id: string) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function Home({ searchQuery, onNavigate }: HomeProps) {
  const [quicklinks, setQuicklinks] = useState<HomeContent[]>([])
  const [loadingLinks, setLoadingLinks] = useState(true)

  useEffect(() => {
    supabase
      .from('home_content')
      .select('*')
      .in('type', ['quicklink', 'link'])
      .order('priority')
      .then(({ data }) => {
        setQuicklinks(data ?? [])
        setLoadingLinks(false)
      })
  }, [])

  // -------------------------------------------------------------------------
  // Commented-out: announcements & tips data fetching
  // Re-enable by restoring the useEffect below and adding sections to the JSX.
  //
  // const [items, setItems] = useState<HomeContent[]>([])
  // const [loading, setLoading] = useState(true)
  //
  // useEffect(() => {
  //   supabase
  //     .from('home_content')
  //     .select('*')
  //     .order('priority')
  //     .then(({ data }) => {
  //       setItems(data ?? [])
  //       setLoading(false)
  //     })
  // }, [])
  //
  // const filtered = items.filter((item) => {
  //   if (!searchQuery) return true
  //   const q = searchQuery.toLowerCase()
  //   return item.title.toLowerCase().includes(q) || (item.body ?? '').toLowerCase().includes(q)
  // })
  //
  // const announcements = filtered.filter((i) => i.type === 'announcement')
  // const tips = filtered.filter((i) => i.type === 'tip')
  // -------------------------------------------------------------------------

  const filteredLinks = quicklinks.filter((item) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return item.title.toLowerCase().includes(q) || (item.body ?? '').toLowerCase().includes(q)
  })

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* 1. Welcome & Info Banner — retained exactly as-is                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-2xl bg-darden-navy text-white px-6 py-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)',
          }}
        />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-darden-orange/20 border border-darden-orange/30 px-3 py-1 text-xs text-darden-orange font-medium mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-darden-orange animate-pulse" />
            Live · Class of 2028
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Section Zero</h1>
          <p className="mt-2 text-white/70 text-sm leading-relaxed max-w-lg">
            <i>"Helping you adult before your real Section takes over"</i>
            <br />
            Everything from the WhatsApp mishmash — organized, searchable, and (mostly) accurate.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Scalable Tile Grid                                                */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Explore
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {TILE_CONFIG.map((tile) => {
            const Icon = tile.icon
            return (
              <button
                key={tile.id}
                onClick={() => onNavigate(tile.id)}
                className="group text-left rounded-xl border border-border bg-card px-4 py-4 hover:border-darden-orange/50 hover:bg-accent/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div
                  className={cn(
                    'inline-flex items-center justify-center rounded-lg p-2 mb-3',
                    tile.accent
                  )}
                >
                  <Icon className={cn('h-4 w-4', tile.iconColor)} />
                </div>
                <div className="text-sm font-semibold text-foreground leading-tight">
                  {tile.label}
                </div>
                <div className="mt-1 text-xs text-muted-foreground leading-snug line-clamp-2">
                  {tile.description}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Scalable Tabbed Container — fixed height, internal scroll         */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <Tabs defaultValue={HOME_TABS_CONFIG[0].id} className="w-full">
          <TabsList className="mb-3">
            {HOME_TABS_CONFIG.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Fixed-height container shared by all tab panels */}
          <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ height: '480px' }}>

            {/* Quick Links tab */}
            <TabsContent value="quicklinks" className="h-full overflow-y-auto p-4 m-0">
              {loadingLinks ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-lg" />
                  ))}
                </div>
              ) : filteredLinks.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? `No quick links match "${searchQuery}"` : 'No quick links yet.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredLinks.map((item) => (
                    <a
                      key={item.id}
                      href={item.url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 hover:border-darden-orange/50 hover:bg-accent/30 transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-foreground">{item.title}</div>
                        {item.body && (
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {item.body}
                          </div>
                        )}
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-darden-orange transition-colors" />
                    </a>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* My To-Do List tab */}
            <TabsContent value="todo" className="h-full overflow-y-auto p-4 m-0">
              <PersonalTodoView searchQuery={searchQuery} />
            </TabsContent>

          </div>
        </Tabs>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Commented-out sections — data preserved in DB, UI hidden             */}
      {/* ------------------------------------------------------------------ */}
      {/*
        ANNOUNCEMENTS SECTION — re-enable when needed
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

        TIPS FROM THE GROUP SECTION — re-enable when needed
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
      */}
    </div>
  )
}
