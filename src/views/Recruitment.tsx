import { useEffect, useState } from 'react'
import { MessageCircle, ExternalLink, Tag, FileText, PlayCircle, BookOpen, BriefcaseBusiness } from 'lucide-react'
import { supabase, type Recruitment } from '@/lib/supabase'

type Track = 'general' | 'consulting' | 'ib' | 'tech'

const TABS: { id: Track; label: string }[] = [
  { id: 'consulting', label: 'Consulting' },
  { id: 'ib', label: 'Investment Banking' },
  { id: 'tech', label: 'Tech' },
  { id: 'general', label: 'General' }
]

const CATEGORY_LABELS: Record<string, string> = {
  'career-event': 'Career Event',
  'peer-tip': 'Peer Tip',
  'peer-intel': 'Peer Intel',
  'resource': 'Resource',
  'whatsapp-group': 'Group Invite',
}

// Sort order: actionable link cards first, context cards last
const CATEGORY_SORT_ORDER: Record<string, number> = {
  'whatsapp-group': 0,
  'resource': 1,
  'career-event': 2,
  'peer-tip': 3,
  'peer-intel': 4,
}

// Button label per URL domain / category
function ctaLabel(url: string, category: string): string {
  if (category === 'whatsapp-group') return 'Join WhatsApp Group'
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) return 'Open Shared Document'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'Watch Video'
  if (url.includes('linkedin.com/posts')) return 'View Job Post'
  if (url.includes('linkedin.com/in')) return 'View LinkedIn'
  if (url.includes('mckinsey.com')) return 'View Program'
  if (url.includes('dardenibprep.com')) return 'Access Prep Site'
  if (url.includes('prepmatter.com')) return 'Access Prep Tool'
  if (url.includes('mconsultingprep.com')) return 'Access Free Prep'
  if (url.includes('darden-virginia.zoom.us') || url.includes('zoom.us')) return 'Join Zoom'
  if (url.includes('apply.darden.virginia.edu')) return 'Register'
  if (url.includes('mailto:')) return 'Send Email'
  if (category === 'career-event') return 'View Event'
  return 'Open Resource'
}

// Button style: WhatsApp groups and community invites = orange; resources/docs = navy; career events = secondary
function ctaStyle(url: string, category: string): string {
  if (category === 'whatsapp-group') {
    return 'bg-accent text-accent-foreground hover:opacity-90'
  }
  if (
    url.includes('drive.google.com') ||
    url.includes('docs.google.com') ||
    url.includes('dardenibprep.com') ||
    url.includes('mconsultingprep.com') ||
    url.includes('prepmatter.com') ||
    url.includes('mckinsey.com')
  ) {
    return 'bg-primary text-primary-foreground hover:opacity-90'
  }
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'bg-primary text-primary-foreground hover:opacity-90'
  }
  return 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
}

// Left border accent per category
function cardAccentClass(category: string): string {
  if (category === 'whatsapp-group') return 'border-l-4 border-l-accent'
  if (category === 'resource') return 'border-l-4 border-l-primary'
  return ''
}

// Icon per category/url
function CardIcon({ url, category }: { url: string | null; category: string }) {
  if (category === 'whatsapp-group') return <MessageCircle className="h-4 w-4 shrink-0 text-accent" />
  if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) return <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
  if (url && (url.includes('drive.google.com') || url.includes('docs.google.com'))) return <FileText className="h-4 w-4 shrink-0 text-primary" />
  if (url && url.includes('dardenibprep.com')) return <BriefcaseBusiness className="h-4 w-4 shrink-0 text-primary" />
  if (category === 'resource') return <BookOpen className="h-4 w-4 shrink-0 text-primary" />
  return null
}

interface RecruitmentProps {
  searchQuery: string
}

function EmptyTrack({ track }: { track: Track }) {
  const messages: Record<Track, { heading: string; body: string }> = {
    general: {
      heading: 'No general intel parsed yet.',
      body: "General recruiting discussions hadn't surfaced in the chats at the time of parsing. When classmates start sharing broad tips, program info, or career center announcements in the group — it lands here.",
    },
    consulting: {
      heading: 'Consulting intel is quiet so far.',
      body: "The chats haven't surfaced consulting-specific timelines, case prep tips, or firm invites yet. Once classmates start sharing that in the WhatsApp groups, it will show up here — verbatim.",
    },
    ib: {
      heading: 'Not much IB chatter yet.',
      body: 'Investment banking discussions were sparse in the chats parsed. A few IB-related messages are above. More will be added as classmates share firm timelines, networking tips, or group invites.',
    },
    tech: {
      heading: 'Tech tab is empty — unusual.',
      body: "The Tech Club chat had plenty of material. If you're seeing this, something may have gone sideways with the data load.",
    },
  }
  const { heading, body } = messages[track]
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <MessageCircle className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="max-w-sm space-y-2">
        <h3 className="text-sm font-semibold text-foreground">{heading}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

function RecruitmentCard({ item }: { item: Recruitment }) {
  const categoryLabel = CATEGORY_LABELS[item.category] ?? item.category
  const accent = cardAccentClass(item.category)
  const isActionable = item.category === 'whatsapp-group' || item.category === 'resource'

  return (
    <div className={`rounded-xl border border-border bg-card overflow-hidden ${accent}`}>
      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start gap-2.5">
          {item.url && <CardIcon url={item.url} category={item.category} />}
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  item.category === 'whatsapp-group'
                    ? 'text-accent'
                    : item.category === 'resource'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {categoryLabel}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-foreground leading-snug">{item.title}</h4>
          </div>
        </div>

        {/* Body */}
        {item.body && (
          <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA Button */}
        {item.url && (
          <a
            href={item.url}
            target={item.url.startsWith('mailto:') ? undefined : '_blank'}
            rel="noopener noreferrer"
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity ${ctaStyle(item.url, item.category)} ${isActionable ? 'mt-1' : ''}`}
          >
            {item.category === 'whatsapp-group' && <MessageCircle className="h-4 w-4" />}
            {(item.url.includes('youtube.com') || item.url.includes('youtu.be')) && <PlayCircle className="h-4 w-4" />}
            {(item.url.includes('drive.google.com') || item.url.includes('docs.google.com')) && <FileText className="h-4 w-4" />}
            {ctaLabel(item.url, item.category)}
            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </a>
        )}
      </div>
    </div>
  )
}

type SubTab = 'resources' | 'peer-intel'

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'resources', label: 'Resources' },
  { id: 'peer-intel', label: 'Peer Intel' },
]

export function RecruitmentView({ searchQuery }: RecruitmentProps) {
  const [activeTab, setActiveTab] = useState<Track>('consulting')
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('resources')
  const [cards, setCards] = useState<Recruitment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setActiveSubTab('resources')
    setLoading(true)
    supabase
      .from('recruitment')
      .select('*')
      .eq('track', activeTab)
      .then(({ data }) => {
        const sorted = (data ?? []).sort((a, b) => {
          const aOrder = CATEGORY_SORT_ORDER[a.category] ?? 99
          const bOrder = CATEGORY_SORT_ORDER[b.category] ?? 99
          if (aOrder !== bOrder) return aOrder - bOrder
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        })
        setCards(sorted)
        setLoading(false)
      })
  }, [activeTab])

  const filtered = searchQuery.trim()
    ? cards.filter((c) => {
        const q = searchQuery.toLowerCase()
        return (
          c.title.toLowerCase().includes(q) ||
          (c.body ?? '').toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
        )
      })
    : cards

  // Split into actionable (resource/whatsapp/career-event) and context (peer-*) for visual grouping
  const actionable = filtered.filter((c) => c.category === 'resource' || c.category === 'whatsapp-group' || c.category === 'career-event')
  const context = filtered.filter((c) => c.category !== 'resource' && c.category !== 'whatsapp-group' && c.category !== 'career-event')

  const visibleCards = activeSubTab === 'resources' ? actionable : context

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Recruiting</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tips, timelines, and resources — sourced directly from the Class of 2028 WhatsApp groups.
        </p>
      </div>

      {/* Track tabs */}
      <div className="flex gap-1 rounded-xl bg-muted/40 p-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex-shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-3 border-b border-border">
        {SUB_TABS.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setActiveSubTab(sub.id)}
            className={[
              'pb-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeSubTab === sub.id
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* Card stream */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl border border-border bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : visibleCards.length === 0 ? (
        <EmptyTrack track={activeTab} />
      ) : (
        <div className="space-y-3">
          {visibleCards.map((item) => (
            <RecruitmentCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-2">
        All content above was sourced from the Darden Class of 2028 WhatsApp groups. Nothing here is made up or externally recommended.
      </p>
    </div>
  )
}
