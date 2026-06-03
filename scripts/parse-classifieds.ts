import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
const GITHUB_CDN = 'https://raw.githubusercontent.com/violet-owl/Section-Zero-Assets/main/'
const DATA_DIR = path.join(import.meta.dirname, '../src/data')
const WINDOW_SECONDS = 120

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedLine {
  ts: Date
  sender: string
  senderRaw: string
  body: string
  filename: string | null
}

interface AdAnchor {
  ts: Date
  sender: string
  senderRaw: string
  body: string
  images: string[]
  category: 'housing' | 'furniture' | 'vehicles' | 'electronics' | 'misc'
}

interface ClassifiedRow {
  title: string
  price: string | null
  category: 'housing' | 'furniture' | 'vehicles' | 'electronics' | 'misc'
  description: string
  contact_masked: string
  images: string[]
  status: 'open' | 'closed'
  source: 'historical'
  region: null
  created_at: string
  updated_at: string
}

// ─── Parse helpers ────────────────────────────────────────────────────────────

const LINE_RE = /^(\d{2}\/\d{2}\/\d{2}), (\d{2}:\d{2}) - ([^:]+): ([\s\S]*)$/
const SYSTEM_PATTERNS = [
  /joined using a group link/,
  /joined from the community/,
  /was added/,
  /were added/,
  /created group/,
  /Messages and calls are end-to-end encrypted/,
  /pinned a message/,
  /changed their phone number/,
  /changed the group/,
  /This message was deleted/,
  /You joined/,
]
const FILE_RE = /^(.+\.(jpg|jpeg|png|gif|pdf|ppt|pptx|webp|mp4|mov)) \(file attached\)$/i

// Official accounts that should never be treated as ad posters
const ADMIN_SENDERS = new Set([
  '+14343407727', // Darden official Instagram / SAC account
  '+14348840628',
  '+14342346275',
  '+19548060771', // Darden admissions/intl office
  '+14342353024', // Career center
])

// System event lines that lack the ": message" colon — these don't match LINE_RE
const SYSTEM_EVENT_RE = /^\d{2}\/\d{2}\/\d{2}, \d{2}:\d{2} - .+(joined using a group link|joined from the community|was added|were added|created group|Messages and calls are end-to-end encrypted|pinned a message|changed their phone number|changed the group|This message was deleted|You joined|left)/

function parseDate(d: string, t: string): Date {
  const [day, month, year] = d.split('/').map(Number)
  const [hour, minute] = t.split(':').map(Number)
  return new Date(2000 + year, month - 1, day, hour, minute, 0)
}

function canonicalize(raw: string): string {
  if (raw.startsWith('+') || /^\d/.test(raw)) return raw.replace(/[\s\-().]/g, '')
  return raw.trim().toLowerCase()
}

function isSystem(senderRaw: string, body: string): boolean {
  if (senderRaw === 'You') return true
  return SYSTEM_PATTERNS.some(p => p.test(body))
}

function parseFile(filepath: string): ParsedLine[] {
  const text = fs.readFileSync(filepath, 'utf8')
  const lines: ParsedLine[] = []
  let cur: ParsedLine | null = null

  for (const raw of text.split('\n')) {
    const m = LINE_RE.exec(raw)
    if (m) {
      if (cur) lines.push(cur)
      const [, date, time, senderRaw, body] = m
      const sender = canonicalize(senderRaw)
      const ts = parseDate(date, time)
      if (isSystem(senderRaw, body.trim())) { cur = null; continue }
      const fm = FILE_RE.exec(body.trim())
      cur = fm
        ? { ts, sender, senderRaw, body: '', filename: fm[1] }
        : { ts, sender, senderRaw, body: body.trim(), filename: null }
    } else if (cur) {
      const fm = FILE_RE.exec(raw.trim())
      if (fm) {
        lines.push(cur)
        cur = { ts: cur.ts, sender: cur.sender, senderRaw: cur.senderRaw, body: '', filename: fm[1] }
      } else if (raw.trim() && raw.trim() !== '<Media omitted>' && !SYSTEM_EVENT_RE.test(raw)) {
        cur.body = cur.body ? cur.body + '\n' + raw.trim() : raw.trim()
      }
    }
  }
  if (cur) lines.push(cur)
  return lines
}

// ─── Ad detection ─────────────────────────────────────────────────────────────

// An OFFERING pattern: the person is providing something for others to take
const OFFER_KW = new RegExp([
  "I('m|\\s+am)\\s+(subleasing|subletting|selling|offering|renting\\s+out|looking\\s+to\\s+(transfer|sublease|sublet)|transferring\\s+my)",
  "for\\s+(sale|rent)\\b",
  "lease\\s+(transfer|takeover)\\s+(available|open|starting|from)",
  "available\\s+for\\s+(sublease|sublet|lease\\s*(transfer|takeover))",
  "move.?out\\s*sale",
  "moving\\s+out.*\\bsale",
  "fully\\s+furnished.*available",
  "subleasing\\s+my",
  "subletting\\s+my",
  "transferring\\s+my\\s+lease",
  "offering\\s+a\\s+lease",
  "looking\\s+to\\s+transfer\\s+my\\s+(1|2|lease)",
  "available\\s+(for\\s+)?sublease",
  "room\\s+available\\b",
  "apartment.*available.*\\bDM\\b",
  "selling\\s+my\\s+(car|furniture|laptop|razer|stuff|items|2015|2016|2017|2018|2019|2020|2021)\\b",
  "giving\\s+away",
  "free\\s+to\\s+a\\s+good\\s+home",
  "price\\s+is\\s+\\$",
  "rent\\s+is\\s+\\$",
  "asking\\s+\\$",
].join('|'), 'i')

// Price in a selling context (not just a passing mention of a price)
function hasOfferPrice(body: string): boolean {
  const hasPrice = /\$\s*[\d,]{2,}/.test(body)
  if (!hasPrice) return false
  return /\b(rent|price|asking|per\s*month|\/mo|for\s*sale|OBO\b|subleas|selling|transfer\s+fee|lease\s+for\s+\$)\b/i.test(body)
}

// Named PDF move-out sales
function isAttachmentSale(body: string): boolean {
  return /move.?out\s*sale|moving.?out\s*sale/i.test(body)
}

// Patterns that disqualify a message even if it matches offer keywords
const FALSE_POSITIVE_PATTERNS = [
  // Asking for a hotel / short stay / travel logistics
  /comfort\s+inn|motel|hotel|airbnb/i,
  // Gym membership / club fees
  /membership.*per\s*month|gym\s*(fee|membership)|fitness.*\$\d/i,
  // Juno / student loan leaderboard
  /juno\.us|juno\s+leaderboard|darden\s+(leads|rank)|sign.?up\s+is\s+free.*loan/i,
  // Conference / event tickets
  /conference.*ticket|ticket\s+price|use\s+code.*off|coupon|discount\s+code/i,
  // "Looking for" without an offer (buyer/seeker)
  /^(looking\s+for|seeking|iso\b|I\s+am\s+looking\s+for\s+a|hi.{0,30}looking\s+for).{0,200}$/is,
  // Asking whether someone is selling (not offering)
  /^.{0,30}(anyone\s+(selling|have|know)|does\s+anyone\s+(have|know|sell)|any\s+(1b|2b|1br|2br)|is\s+(there|anyone)\s+(a|selling)).{0,200}$/is,
  // "if anyone has X for sale" - buyer not seller
  /if\s+anyone\s+(has|have)\s+.{0,60}(for\s+sale|selling)/i,
  // "anyone still doing move out sales" - seeking buyer
  /anyone\s+still\s+doing\s+move.?out\s+sale/i,
  // Want-to-connect with current tenant to buy furniture (not an offer)
  /I('ve|have)\s+signed\s+a\s+lease.*current\s+tenant.*furniture/is,
  // Software / digital account sales from non-housing groups
  /prepmatter|leetcode\s+account|udemy\s+account/i,
]

function isAd(body: string): boolean {
  if (!body || body.length < 25) return false

  // Pure URL / near-URL messages — no ad content
  if (/^https?:\/\/\S*\s*$/.test(body.trim())) return false

  // Quick skip for pure reactions / short replies
  if (/^(bump(ing)?|still\s+available|sold!?|interested\b|yes\b|no\b|thanks|thank\s+you|noted|same\b|same\s+here|\+1\b|I\s+am\s+not\b)/i.test(body.trim())) return false

  // Check false positive patterns first
  for (const pat of FALSE_POSITIVE_PATTERNS) {
    if (pat.test(body)) return false
  }

  return OFFER_KW.test(body) || hasOfferPrice(body) || isAttachmentSale(body)
}

// ─── Category classification ──────────────────────────────────────────────────

function classify(body: string): 'housing' | 'furniture' | 'vehicles' | 'electronics' | 'misc' {
  const b = body.toLowerCase()

  // Vehicles: explicit car brand/model or "selling my car"
  if (/\b(bmw|nissan\s+altima|ford\s+escape|toyota|honda|audi|selling\s+(my\s+)?car|2015|2016|2017|2018|2019|2020|2021)\b.*\b(car|bmw|altima|escape|q5|truck|suv)\b/.test(b)) return 'vehicles'
  if (/selling\s+(my\s+)?car\b/.test(b)) return 'vehicles'

  // Electronics: specific devices
  if (/\b(laptop|razer\s+blade|macbook|ipad|iphone|canon\s+camera|camera\b.*giving\s+away|monitor|gaming\s+pc)\b/.test(b)) return 'electronics'

  // Move-out sale (selling items, not a housing offer) → misc unless it also has explicit sublease/rent
  const isMoveOutSale = /move.?out\s*sale|moving\s+out\s*sale/i.test(b)
  const isHousingOffer = /subleas|subleasing|subletting|lease\s*(takeover|transfer)|transfer.*lease|renting\s+out|room\s+available/.test(b)
  if (isMoveOutSale && !isHousingOffer) return 'misc'

  // Housing: anything lease/rent/sublease/apartment/room related
  if (/subleas|subleasing|subletting|lease\s*(takeover|transfer)|transfer.*lease|for\s*(rent|lease)\b|renting\s+out|apartment|bedroom|1b|2b|furnished\s+(home|house|apt|unit)|pavilion|ivy\s*(apt|gardens|drive|\d+)|huntington\s*village|huntwood\s*lane|stonefield|arlington\s*court|crozet.*rent|barracks.*rugby|cottage\s+for\s+rent|townhouse.*rent|house\s+for\s+rent|room\s+available|basement.*rent/.test(b)) return 'housing'

  // Furniture + household goods (pure item sales, no housing context)
  if (/sofa|couch|mattress|bed\s*frame|dresser|nightstand|dining\s*table|office\s*chair|lamp|furniture|wagon|child\s*carrier|gaming\s*chair|bookshelf|wine\s*rack|dishware|dish\s*set|pots\b|appliances|microwave|toaster|kettle|air\s*fryer|washer\s*&?\s*dryer\b/.test(b)) return 'furniture'

  return 'misc'
}

// ─── Price extraction ─────────────────────────────────────────────────────────

function extractPrice(body: string): string | null {
  // Explicit "Rent: $X" or "Rent is $X" label takes priority
  const rentLabel = body.match(/\bRent\s*:?\s*~?\s*\$\s*([\d,]+)/i)
  if (rentLabel) return '$' + rentLabel[1].replace(/,/g, '') + '/mo'
  // Monthly rent
  const monthly = body.match(/\$\s*([\d,]+)\s*\/?\s*(month|mo\b)/i)
  if (monthly) return '$' + monthly[1].replace(/,/g, '') + '/mo'
  // Per-person rent
  const perPerson = body.match(/\$\s*([\d,]+)\s*\/?\s*person/i)
  if (perPerson) return '$' + perPerson[1].replace(/,/g, '') + '/person'
  // Range
  const range = body.match(/\$\s*([\d,]+)\s*[-–]\s*([\d,]+)/i)
  if (range) return '$' + range[1].replace(/,/g, '') + '–$' + range[2].replace(/,/g, '')
  // Single price
  const single = body.match(/\$\s*([\d,]+)/i)
  if (single) return '$' + single[1].replace(/,/g, '')
  return null
}

// ─── Text helpers ─────────────────────────────────────────────────────────────

function makeTitle(body: string): string {
  const clean = body
    .replace(/<Media omitted>/g, '')
    // Strip leading URLs so the title comes from the actual text
    .replace(/^https?:\/\/\S+\s*/gm, '')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const sentence = clean.split(/[.!?]/)[0].trim()
  return sentence.length > 100 ? sentence.slice(0, 97) + '…' : sentence
}

function dedupText(text: string): string {
  const paras = text
    .replace(/<Media omitted>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .split(/\n{2,}/)
  const seen = new Set<string>()
  return paras
    .filter(p => {
      const k = p.trim().toLowerCase()
      if (!k) return false
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .join('\n\n')
    .trim()
}

function maskContact(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  return digits.length >= 4 ? 'X' + digits.slice(-4) : 'X' + raw.slice(-4)
}

// ─── Proximity image collection ───────────────────────────────────────────────

function collectImages(allLines: ParsedLine[], anchor: ParsedLine): string[] {
  const anchorMs = anchor.ts.getTime()
  const windowMs = WINDOW_SECONDS * 1000
  const imgs: string[] = []

  for (const line of allLines) {
    if (line.sender !== anchor.sender || !line.filename) continue
    if (Math.abs(line.ts.getTime() - anchorMs) <= windowMs) {
      imgs.push(GITHUB_CDN + line.filename)
    }
  }
  return [...new Set(imgs)]
}

// ─── Deduplication / bump consolidation ──────────────────────────────────────

function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 3)
  )
}

function tokenOverlap(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0
  let common = 0
  for (const t of a) if (b.has(t)) common++
  return common / Math.min(a.size, b.size)
}

function isSameItem(a: AdAnchor, b: AdAnchor): boolean {
  if (a.sender !== b.sender || a.category !== b.category) return false
  return tokenOverlap(tokenize(a.body), tokenize(b.body)) > 0.5
}

function dedup(anchors: AdAnchor[]): ClassifiedRow[] {
  const used = new Set<number>()
  const rows: ClassifiedRow[] = []

  for (let i = 0; i < anchors.length; i++) {
    if (used.has(i)) continue
    const cluster: AdAnchor[] = [anchors[i]]
    used.add(i)

    for (let j = i + 1; j < anchors.length; j++) {
      if (!used.has(j) && isSameItem(anchors[i], anchors[j])) {
        cluster.push(anchors[j])
        used.add(j)
      }
    }

    cluster.sort((a, b) => a.ts.getTime() - b.ts.getTime())
    const earliest = cluster[0]
    const latest = cluster[cluster.length - 1]
    const allImages = [...new Set(cluster.flatMap(c => c.images))]

    const latestBody = dedupText(latest.body)
    rows.push({
      title: makeTitle(latest.body),
      price: extractPrice(latest.body) ?? extractPrice(earliest.body) ?? null,
      category: latest.category,
      description: latestBody,
      contact_masked: maskContact(latest.senderRaw),
      images: allImages,
      status: 'open',
      source: 'historical',
      region: null,
      created_at: earliest.ts.toISOString(),
      updated_at: latest.ts.toISOString(),
    })
  }

  return rows
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.txt'))
  console.log(`Parsing ${files.length} files from ${DATA_DIR}`)

  const allAnchors: AdAnchor[] = []
  let totalLines = 0

  for (const file of files) {
    const lines = parseFile(path.join(DATA_DIR, file))
    totalLines += lines.length
    let fileAnchors = 0

    for (const line of lines) {
      if (ADMIN_SENDERS.has(line.sender)) continue
      if (!isAd(line.body)) continue

      allAnchors.push({
        ts: line.ts,
        sender: line.sender,
        senderRaw: line.senderRaw,
        body: line.body,
        images: collectImages(lines, line),
        category: classify(line.body),
      })
      fileAnchors++
    }
    console.log(`  ${file}: ${lines.length} lines, ${fileAnchors} ad anchors`)
  }

  console.log(`\nTotal ad anchors: ${allAnchors.length}`)
  const rows = dedup(allAnchors)
  console.log(`After deduplication: ${rows.length} unique listings`)

  const byCat = rows.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
  console.log('By category:', byCat)
  console.log(`With images: ${rows.filter(r => r.images.length > 0).length}`)

  // Clear existing historical classifieds
  const { error: delErr } = await supabase
    .from('classifieds')
    .delete()
    .eq('source', 'historical')

  if (delErr) { console.error('Delete error:', delErr); process.exit(1) }
  console.log('\nCleared existing historical classifieds')

  // Insert in batches
  const BATCH = 50
  let inserted = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await supabase.from('classifieds').insert(rows.slice(i, i + BATCH))
    if (error) { console.error(`Insert error at batch ${i}:`, error); process.exit(1) }
    inserted += Math.min(BATCH, rows.length - i)
  }

  console.log(`\n✓ Inserted ${inserted} historical classifieds`)
  console.log(`Total lines parsed: ${totalLines}`)
}

main().catch(err => { console.error(err); process.exit(1) })
