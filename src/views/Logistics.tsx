import { useEffect, useState } from 'react'
import { supabase, type Logistics } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExternalLink, CheckSquare, MapPin, Globe, Package, ShieldCheck, HeartPulse, Truck, Building } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface LogisticsProps {
  searchQuery: string
}

const categoryMeta: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  'pre-arrival': { label: 'Pre-Arrival', icon: CheckSquare },
  visa: { label: 'Visa', icon: Globe },
  banking: { label: 'Banking', icon: Building },
  insurance: { label: 'Insurance', icon: ShieldCheck },
  healthcare: { label: 'Healthcare', icon: HeartPulse },
  packing: { label: 'Packing', icon: Package },
  transit: { label: 'Transit', icon: MapPin },
  shipping: { label: 'Shipping', icon: Truck },
  orientation: { label: 'Orientation', icon: CheckSquare },
}

const TABS = [/*'pre-arrival',*/ 'transit', 'healthcare', 'visa', 'banking', 'packing',  /*'insurance',*/  /*'orientation', 'shipping'*/] as const

export function LogisticsView({ searchQuery }: LogisticsProps) {
  const [items, setItems] = useState<Logistics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('logistics')
      .select('*')
      .order('priority')
      .then(({ data }) => {
        setItems(data ?? [])
        setLoading(false)
      })
  }, [])

  const filter = (cat: string) =>
    items.filter((item) => {
      if (item.category !== cat) return false
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        item.title.toLowerCase().includes(q) ||
        (item.body ?? '').toLowerCase().includes(q) ||
        item.checklist_items.some((c) => c.toLowerCase().includes(q))
      )
    })

  const activeTabs = TABS.filter((t) => items.some((i) => i.category === t))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Logistics & Pre-Arrival</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Everything you need to check off before your first day at Darden.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="transit">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-auto min-w-max gap-1 bg-muted/50 p-1">
              {activeTabs.map((cat) => {
                const meta = categoryMeta[cat]
                const Icon = meta.icon
                return (
                  <TabsTrigger key={cat} value={cat} className="flex items-center gap-1.5 text-xs px-3 py-1.5 whitespace-nowrap">
                    <Icon className="h-3 w-3" /> {meta.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {activeTabs.map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-4 space-y-3">
              {filter(cat).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {searchQuery ? `No results for "${searchQuery}".` : 'No content yet.'}
                </p>
              ) : filter(cat).map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold">{item.title}</CardTitle>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.region && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.region}</Badge>
                        )}
                        {item.priority <= 1 && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-destructive/80 text-white">High Priority</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    {item.body && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                    )}
                    {item.checklist_items.length > 0 && (
                      <ul className="space-y-1.5">
                        {item.checklist_items.map((ci, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs">
                            <CheckSquare className="h-3 w-3 text-darden-orange shrink-0 mt-0.5" />
                            <span className="text-foreground/80 leading-relaxed">{ci}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-darden-orange hover:underline font-medium"
                      >
                        Official resource <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
