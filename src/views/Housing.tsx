import { useEffect, useState } from 'react'
import { supabase, type Housing } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, MapPin, ExternalLink, AlertTriangle, BookOpen, Shield } from 'lucide-react'

interface HousingProps {
  searchQuery: string
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < rating ? 'text-darden-orange fill-darden-orange' : 'text-muted-foreground'}`}
        />
      ))}
    </div>
  )
}

export function HousingView({ searchQuery }: HousingProps) {
  const [items, setItems] = useState<Housing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('housing')
      .select('*')
      .order('created_at')
      .then(({ data }) => {
        setItems(data ?? [])
        setLoading(false)
      })
  }, [])

  const filter = (type: string) =>
    items.filter((item) => {
      if (item.type !== type) return false
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        item.name.toLowerCase().includes(q) ||
        (item.body ?? '').toLowerCase().includes(q) ||
        (item.address ?? '').toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      )
    })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Housing Guide</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Apartments, reviews, and safety info from classmates who've been there.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="apartment">
          <TabsList className="grid grid-cols-4 h-auto w-full">
            <TabsTrigger value="apartment" className="text-xs py-2">Apartments</TabsTrigger>
            <TabsTrigger value="review" className="text-xs py-2">Reviews</TabsTrigger>
            <TabsTrigger value="safety" className="text-xs py-2">Safety</TabsTrigger>
            <TabsTrigger value="resource" className="text-xs py-2">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="apartment" className="mt-4 space-y-3">
            {filter('apartment').map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold">{item.name}</CardTitle>
                    <StarRating rating={item.rating} />
                  </div>
                  {item.address && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3" /> {item.address}
                    </div>
                  )}
                  {item.price_range && (
                    <div className="text-xs font-semibold text-darden-orange">{item.price_range}</div>
                  )}
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{item.body}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-darden-orange hover:underline font-medium mt-2">
                      View website <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {(['review', 'safety', 'resource'] as const).map((type) => (
            <TabsContent key={type} value={type} className="mt-4 space-y-3">
              {filter(type).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No content yet.</p>
              ) : filter(type).map((item) => (
                <Card key={item.id} className={type === 'safety' ? 'border-l-4 border-l-destructive/60' : ''}>
                  <CardContent className="px-4 py-4">
                    <div className="flex items-start gap-2">
                      {type === 'review' && <BookOpen className="h-3.5 w-3.5 text-darden-orange shrink-0 mt-0.5" />}
                      {type === 'safety' && <AlertTriangle className="h-3.5 w-3.5 text-destructive/80 shrink-0 mt-0.5" />}
                      {type === 'resource' && <Shield className="h-3.5 w-3.5 text-darden-orange shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1">{item.name}</div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-darden-orange hover:underline font-medium mt-2">
                            Learn more <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
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
