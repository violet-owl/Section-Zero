import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

type FeedbackType = 'bug' | 'feature' | 'general'

export function Footer() {
  const [type, setType] = useState<FeedbackType>('general')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    await supabase.from('feedback_submissions').insert({
      type,
      message: message.trim(),
      contact: contact.trim() || null,
    })
    setLoading(false)
    setSubmitted(true)
    setMessage('')
    setContact('')
  }

  return (
    <footer className="mt-16 border-t border-border bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Feedback */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Send Feedback</h3>
            <p className="text-xs text-muted-foreground mb-4">Bug spotted? Feature idea? Just wanna say hi? We''re all classmates here.</p>
            {submitted ? (
              <div className="rounded-lg border border-darden-orange/30 bg-darden-orange/5 p-4 text-sm text-foreground">
                Got it! Thanks for making Section Zero better. You''re the real MVP.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-2">
                  {(['bug', 'feature', 'general'] as FeedbackType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                        type === t
                          ? 'bg-darden-navy text-white border-darden-navy dark:bg-darden-orange dark:border-darden-orange'
                          : 'border-border text-muted-foreground hover:border-foreground'
                      }`}
                    >
                      {t === 'bug' ? 'Bug' : t === 'feature' ? 'Feature Request' : 'General'}
                    </button>
                  ))}
                </div>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What''s on your mind?"
                  className="min-h-[80px] text-sm resize-none"
                  required
                />
                <div className="flex gap-2">
                  <Input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Email"
                    className="text-sm h-8"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={loading || !message.trim()}
                    className="shrink-0 bg-darden-navy hover:bg-darden-navy/90 text-white dark:bg-darden-orange dark:hover:bg-darden-orange/90"
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">A Note on This Site</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              I built this as a classmate helping classmates — not as a Darden-affiliated resource. The information here was crowdsourced from our WhatsApp groups and is provided as-is. Things change, prices fluctuate, listings expire, and life happens. Always verify anything critical (visa deadlines, lease terms, health requirements) directly with official sources.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
              The Classifieds section operates on an honor system. I have no way to verify listings or mediate disputes — buyers and sellers are responsible for their own due diligence. Historical contact numbers have been masked for privacy.
            </p>
            <p className="text-xs text-muted-foreground/60 leading-relaxed mt-3">
              Section Zero is not affiliated with the University of Virginia, Darden School of Business, or any official student organization. No liability is assumed for any loss, confusion, or existential dread arising from the use of this site. Go get that MBA. You''ve earned it.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border/50 flex items-center justify-between">
          <p className="text-xs text-muted-foreground/50">Section Zero · Class of 2028 · Charlottesville, VA</p>
          <p className="text-xs text-muted-foreground/50">Built with love (and panic) by a classmate</p>
        </div>
      </div>
    </footer>
  )
}
