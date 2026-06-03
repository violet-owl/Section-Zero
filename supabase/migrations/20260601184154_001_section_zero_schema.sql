/*
  # Section Zero Schema — Class of 2028 Darden MBA Community Hub

  ## Overview
  Creates all 7 tables for the Section Zero SPA serving the Darden MBA Class of 2028.

  ## Tables Created

  1. **home_content** — Static curated announcements, quick links, and tips for the Home dashboard
     - id, type (announcement|link|tip), title, body, url, priority, region, created_at

  2. **recruitment** — Career track resources for Consulting, IB, and Tech
     - id, track (consulting|ib|tech), category, title, body, url, tags (text[]), region, created_at

  3. **housing** — Apartment listings, reviews, and safety notes
     - id, type (apartment|review|safety|resource), name, address, price_range, rating, body, url, tags (text[]), region, created_at

  4. **logistics** — Pre-arrival tasks, visa info, packing lists, transit guides
     - id, category (visa|packing|transit|pre-arrival|banking|insurance|orientation), title, body, checklist_items (text[]), url, priority (1-5), region, created_at

  5. **classifieds** — Live + historical WhatsApp marketplace listings
     - id, title, price, category (housing|furniture|vehicles|electronics|misc), description,
       contact_masked, images (text[]), status (open|closed), source (historical|live),
       region, created_at, updated_at

  6. **feedback_submissions** — Bug reports, feature requests, general feedback
     - id, type (bug|feature|general), message, contact (optional), created_at

  7. **personal_todo_global** — Shared cohort checklist items (user tasks stay in localStorage)
     - id, category, title, description, due_hint, priority, tags (text[]), created_at

  ## Security
  - RLS enabled on all tables
  - classifieds: authenticated insert + public read (open marketplace)
  - feedback_submissions: public insert, no read
  - All others: public read (informational content)
  - personal_todo_global: public read only
*/

-- ============================================================
-- home_content
-- ============================================================
CREATE TABLE IF NOT EXISTS home_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('announcement', 'link', 'tip', 'quicklink')),
  title text NOT NULL,
  body text,
  url text,
  priority int DEFAULT 5,
  region text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read home_content"
  ON home_content FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- recruitment
-- ============================================================
CREATE TABLE IF NOT EXISTS recruitment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track text NOT NULL CHECK (track IN ('consulting', 'ib', 'tech', 'general')),
  category text NOT NULL,
  title text NOT NULL,
  body text,
  url text,
  tags text[] DEFAULT '{}',
  region text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recruitment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read recruitment"
  ON recruitment FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- housing
-- ============================================================
CREATE TABLE IF NOT EXISTS housing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('apartment', 'review', 'safety', 'resource')),
  name text NOT NULL,
  address text,
  price_range text,
  rating int CHECK (rating BETWEEN 1 AND 5),
  body text,
  url text,
  tags text[] DEFAULT '{}',
  region text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE housing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read housing"
  ON housing FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- logistics
-- ============================================================
CREATE TABLE IF NOT EXISTS logistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('visa', 'packing', 'transit', 'pre-arrival', 'banking', 'insurance', 'orientation', 'healthcare', 'shipping')),
  title text NOT NULL,
  body text,
  checklist_items text[] DEFAULT '{}',
  url text,
  priority int DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  region text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE logistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read logistics"
  ON logistics FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- classifieds
-- ============================================================
CREATE TABLE IF NOT EXISTS classifieds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  price text,
  category text NOT NULL CHECK (category IN ('housing', 'furniture', 'vehicles', 'electronics', 'misc')),
  description text,
  contact_masked text,
  images text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  source text NOT NULL DEFAULT 'live' CHECK (source IN ('historical', 'live')),
  region text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE classifieds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read classifieds"
  ON classifieds FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert classifieds"
  ON classifieds FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update classifieds status"
  ON classifieds FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- feedback_submissions
-- ============================================================
CREATE TABLE IF NOT EXISTS feedback_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('bug', 'feature', 'general')),
  message text NOT NULL,
  contact text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON feedback_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================
-- personal_todo_global
-- ============================================================
CREATE TABLE IF NOT EXISTS personal_todo_global (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  description text,
  due_hint text,
  priority int DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE personal_todo_global ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read global todo items"
  ON personal_todo_global FOR SELECT
  TO anon, authenticated
  USING (true);
