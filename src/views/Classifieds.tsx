import { useEffect, useState } from 'react'
import { supabase, type Classified } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ImageCarousel } from '@/components/ImageCarousel'
import { HonorModal } from '@/components/HonorModal'
import { Info, Plus, X, MessageSquare, Home, Sofa, Car, Cpu, Package, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClassifiedsProps {
  searchQuery: string
}

const categoryMeta: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  housing: { label: 'Housing', icon: Home },
  furniture: { label: 'Furniture', icon: Sofa },
  vehicles: { label: 'Vehicles', icon: Car },
  electronics: { label: 'Electronics', icon: Cpu },
  misc: { label: 'Misc', icon: Package },
}

const statusColors: Record<string, string> = {
  open: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  closed: 'bg-muted text-muted-foreground',
}

type NewListing = {
  title: string
  price: string
  category: Classified['category']
  description: string
  contact_masked: string
  media_link: string
}

export function ClassifiedsView({ searchQuery }: ClassifiedsProps) {
  const [items, setItems] = useState<Classified[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [honor, setHonor] = useState<{ id: string; action: 'close' | 'reopen' } | null>(null)
  const [form, setForm] = useState<NewListing>({
    title: '', price: '', category: 'misc', description: '', contact_masked: '', media_link: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchListings()
  }, [])

  async function fetchListings() {
    const { data } = await supabase.from('classifieds').select('*').order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  const filtered = items.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description ?? '').toLowerCase().includes(q) ||
      (item.price ?? '').toLowerCase().includes(q)
    )
  })

  async function handleToggleStatus(id: string, current: string) {
    const action = current === 'open' ? 'close' : 'reopen'
    setHonor({ id, action })
  }

  async function confirmToggle() {
    if (!honor) return
    const newStatus = honor.action === 'close' ? 'closed' : 'open'
    await supabase.from('classifieds').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', honor.id)
    setItems((prev) => prev.map((i) => i.id === honor.id ? { ...i, status: newStatus } : i))
    setHonor(null)
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.contact_masked) return
    setSubmitting(true)
    const { data } = await supabase.from('classifieds').insert({
      title: form.title,
      price: form.price,
      category: form.category,
      description: form.description,
      contact_masked: form.contact_masked,
      images: form.media_link ? [form.media_link] : [],
      status: 'open',
      source: 'live',
    }).select().maybeSingle()
    if (data) setItems((prev) => [data, ...prev])
    setSubmitting(false)
    setShowForm(false)
    setForm({ title: '', price: '', category: 'misc', description: '', contact_masked: '', media_link: '' })
  }

  const categories = ['all', ...Object.keys(categoryMeta)]

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Classifieds</h2>
          <p className="text-sm text-muted-foreground">The Unofficial Darden Marketplace. Keep it clean!</p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className={cn(
            'gap-1.5 transition-all',
            showForm
              ? 'bg-muted text-foreground hover:bg-muted'
              : 'bg-darden-navy text-white hover:bg-darden-navy/90 dark:bg-darden-orange dark:hover:bg-darden-orange/90'
          )}
        >
          {showForm ? <><X className="h-3.5 w-3.5" /> Cancel</> : <><Plus className="h-3.5 w-3.5" /> Post Ad</>}
        </Button>
      </div>
      {/* Contact Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-darden-orange/60 bg-darden-orange/10 px-4 py-3.5">
        <MessageSquare className="h-5 w-5 text-darden-orange shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-darden-orange mb-0.5">How to contact sellers</p>
          <p className="text-xs text-foreground/80 leading-relaxed">
            Full contact numbers are masked for privacy. Copy the last 4-digits displayed and search in the WhatsApp group members to find the original poster.
          </p>
        </div>
      </div>
      {/* Post Form */}
      {showForm && (
        <Card className="border-darden-orange/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-4 w-4 text-darden-orange" />
              <p className="text-xs text-muted-foreground">Posts are visible to all classmates. Keep it classy.</p>
            </div>
            <form onSubmit={handlePost} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="title" className="text-xs">Title *</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. IKEA desk and chair" required className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="price" className="text-xs">Price</Label>
                  <Input id="price" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. $150 or FREE" className="h-8 text-sm" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Category *</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value as Classified['category'] }))}
                    className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {Object.entries(categoryMeta).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contact" className="text-xs">Contact (WhatsApp last 4 digits or name) *</Label>
                  <Input id="contact" value={form.contact_masked} onChange={(e) => setForm(f => ({ ...f, contact_masked: e.target.value }))} placeholder="e.g. X3102 or @name" required className="h-8 text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="desc" className="text-xs">Description</Label>
                <Textarea id="desc" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Details about the item, condition, pickup location..." className="text-sm min-h-[80px] resize-none" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="media_link" className="text-xs">Media Link (Google Drive, OneDrive, etc.)</Label>
                <Input id="media_link" value={form.media_link} onChange={(e) => setForm(f => ({ ...f, media_link: e.target.value }))} placeholder="https://drive.google.com/..." className="h-8 text-sm" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">Due to storage constraints, direct media uploads are disabled. Paste a link to a public folder (containing the media) or file (pdf, ppt).</p>
              </div>
              <Button type="submit" disabled={submitting} size="sm" className="bg-darden-navy text-white hover:bg-darden-navy/90 dark:bg-darden-orange dark:hover:bg-darden-orange/90">
                {submitting ? 'Posting...' : 'Post Listing'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors whitespace-nowrap',
              activeCategory === cat
                ? 'bg-darden-navy text-white border-darden-navy dark:bg-darden-orange dark:border-darden-orange'
                : 'border-border text-muted-foreground hover:border-foreground'
            )}
          >
            {cat === 'all' ? 'All' : categoryMeta[cat].label}
          </button>
        ))}
      </div>

      {/* Listings */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{searchQuery ? `No listings match "${searchQuery}"` : 'No listings in this category.'}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((item) => {
            const CatIcon = categoryMeta[item.category]?.icon ?? Package
            return (
              <Card key={item.id} className={cn(item.status === 'closed' && 'opacity-60')}>
                <ImageCarousel images={item.images} alt={item.title} />
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <CatIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{categoryMeta[item.category]?.label}</span>
                        {item.region && <Badge variant="outline" className="text-[10px] px-1 py-0">{item.region}</Badge>}
                      </div>
                      <h3 className="text-sm font-semibold leading-tight line-clamp-2">{item.title}</h3>
                      {item.price && <p className="text-sm font-bold text-darden-orange mt-0.5">{item.price}</p>}
                    </div>
                    <Badge className={cn('text-[10px] px-1.5 py-0 shrink-0', statusColors[item.status])}>
                      {item.status === 'open' ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                    {item.contact_masked && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span className="font-medium text-foreground">{item.contact_masked}</span>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleStatus(item.id, item.status)}
                      className="h-7 text-xs ml-auto"
                    >
                      {item.status === 'open' ? 'Mark Closed' : 'Reopen'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <HonorModal
        open={honor !== null}
        action={honor?.action ?? 'close'}
        onConfirm={confirmToggle}
        onCancel={() => setHonor(null)}
      />
    </div>
  )
}
