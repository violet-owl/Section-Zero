import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface HomeContent {
  id: string
  type: 'announcement' | 'link' | 'tip' | 'quicklink'
  title: string
  body: string | null
  url: string | null
  priority: number
  region: string | null
  created_at: string
}

export interface Recruitment {
  id: string
  track: 'consulting' | 'ib' | 'tech' | 'general'
  category: string
  title: string
  body: string | null
  url: string | null
  tags: string[]
  region: string | null
  created_at: string
}

export interface Housing {
  id: string
  type: 'apartment' | 'review' | 'safety' | 'resource'
  name: string
  address: string | null
  price_range: string | null
  rating: number | null
  body: string | null
  url: string | null
  tags: string[]
  region: string | null
  created_at: string
}

export interface Logistics {
  id: string
  category: 'visa' | 'packing' | 'transit' | 'pre-arrival' | 'banking' | 'insurance' | 'orientation' | 'healthcare' | 'shipping'
  title: string
  body: string | null
  checklist_items: string[]
  url: string | null
  priority: number
  region: string | null
  created_at: string
}

export interface Classified {
  id: string
  title: string
  price: string | null
  category: 'housing' | 'furniture' | 'vehicles' | 'electronics' | 'misc'
  description: string | null
  contact_masked: string | null
  images: string[]
  status: 'open' | 'closed'
  source: 'historical' | 'live'
  region: string | null
  created_at: string
  updated_at: string
}

export interface FeedbackSubmission {
  id: string
  type: 'bug' | 'feature' | 'general'
  message: string
  contact: string | null
  created_at: string
}

export interface PersonalTodoGlobal {
  id: string
  category: string
  title: string
  description: string | null
  due_hint: string | null
  priority: number
  tags: string[]
  created_at: string
}

export const GITHUB_CDN = 'https://raw.githubusercontent.com/violet-owl/Section-Zero-Assets/main/'
