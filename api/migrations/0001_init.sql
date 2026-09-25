-- LakeShore Legends booking backend — initial schema.
-- Dates are local calendar dates (YYYY-MM-DD) and times are local wall-clock
-- times (HH:MM) in the program time zone (settings.timezone, default
-- America/Chicago). Storing wall-clock values keeps recurring availability
-- stable across daylight-saving changes; UTC instants are derived when needed.

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('director', 'coach')),
  pass_hash TEXT NOT NULL,
  pass_salt TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  phone TEXT,
  bio TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE auth_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,              -- public area / town label
  facility_name TEXT,
  address TEXT,                    -- private; only shared with confirmed bookings
  parking TEXT,
  indoor_outdoor TEXT,             -- 'indoor' | 'outdoor' | 'both' | null
  weather_notes TEXT,
  hours TEXT,
  eligible_type_ids TEXT,          -- JSON array; null = all services
  rental_cost_cents INTEGER,
  rental_basis TEXT,               -- 'hourly' | 'per_session' | null
  active INTEGER NOT NULL DEFAULT 1,
  archived_at TEXT,
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE session_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  size TEXT NOT NULL,              -- display format, e.g. '1-on-1'
  duration INTEGER NOT NULL,
  min_participants INTEGER NOT NULL DEFAULT 1,
  max_participants INTEGER NOT NULL DEFAULT 1,
  pricing_basis TEXT NOT NULL DEFAULT 'group' CHECK (pricing_basis IN ('athlete', 'group')),
  pay_link TEXT,
  stripe_price_cents INTEGER,      -- cached from Stripe; Stripe stays authoritative
  stripe_currency TEXT,
  stripe_checked_at TEXT,
  stripe_check_status TEXT,        -- 'verified' | 'unavailable' | 'mismatch' | 'error'
  stripe_check_detail TEXT,
  eligible_loc_ids TEXT,           -- JSON array; null = all locations
  coach_ids TEXT,                  -- JSON array; null = any coach
  booking_mode TEXT NOT NULL DEFAULT 'immediate' CHECK (booking_mode IN ('immediate', 'request')),
  description TEXT,
  prep_instructions TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  archived_at TEXT,
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE availability_series (
  id TEXT PRIMARY KEY,
  weekdays TEXT NOT NULL,          -- JSON array of 0-6 (Sun-Sat)
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration INTEGER NOT NULL,
  buffer INTEGER NOT NULL DEFAULT 0,
  loc_id TEXT NOT NULL,
  coach_id TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE slots (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  loc_id TEXT NOT NULL,
  coach_id TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'held', 'booked')),
  booking_id TEXT,
  contingent INTEGER NOT NULL DEFAULT 0,  -- B2B: only offered once its anchor is booked
  contingent_on TEXT,
  series_id TEXT,
  series_detached INTEGER NOT NULL DEFAULT 0,
  bump_record TEXT,                -- JSON: conflict changes made when booked (for revert)
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX slots_date ON slots(date);
CREATE INDEX slots_series ON slots(series_id);

CREATE TABLE blocks (
  id TEXT PRIMARY KEY,
  coach_id TEXT,                   -- null = applies to every coach
  date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  start_time TEXT,                 -- null = all day
  end_time TEXT,
  reason TEXT NOT NULL DEFAULT 'other',
  note TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX blocks_date ON blocks(date);

CREATE TABLE families (
  id TEXT PRIMARY KEY,
  parent_name TEXT NOT NULL,
  email TEXT,
  email_norm TEXT,
  phone TEXT,
  notes_private TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX families_email ON families(email_norm);

CREATE TABLE athletes (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id),
  name TEXT NOT NULL,
  grade TEXT,
  goals TEXT,
  notes_private TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX athletes_family ON athletes(family_id);

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('dated', 'request')),
  status TEXT NOT NULL CHECK (status IN ('requested', 'awaiting_payment', 'confirmed', 'completed', 'canceled', 'declined', 'expired')),
  attendance TEXT NOT NULL DEFAULT 'not_recorded' CHECK (attendance IN ('not_recorded', 'present', 'late', 'no_show')),
  payment_status TEXT NOT NULL DEFAULT 'unknown' CHECK (payment_status IN ('unknown', 'unpaid', 'pending', 'paid', 'partially_refunded', 'refunded', 'package_credit', 'complimentary')),
  family_id TEXT REFERENCES families(id),
  athlete_id TEXT REFERENCES athletes(id),
  type_id TEXT,
  snapshot TEXT NOT NULL,          -- JSON: service name/duration/price/location as booked
  slot_id TEXT,
  date TEXT,
  time TEXT,
  duration INTEGER,
  loc_id TEXT,
  coach_id TEXT,
  players TEXT,
  roster TEXT,                     -- JSON array of participants
  payer_mode TEXT NOT NULL DEFAULT 'one' CHECK (payer_mode IN ('one', 'each')),
  request TEXT,                    -- JSON: requested day/time/location as submitted
  form TEXT NOT NULL,              -- JSON: registration answers as submitted
  private_notes TEXT,              -- coach-only
  hold_expires_at TEXT,            -- UTC ISO; set while a checkout reservation is held
  checkout_ref TEXT,               -- value sent to Stripe as client_reference_id
  cancel_info TEXT,                -- JSON: outcome chosen in the cancel dialog
  attention TEXT,                  -- human-readable flag needing coach review
  legacy INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX bookings_date ON bookings(date);
CREATE INDEX bookings_family ON bookings(family_id);
CREATE UNIQUE INDEX bookings_checkout_ref ON bookings(checkout_ref);
-- One live booking per slot, enforced by the database.
CREATE UNIQUE INDEX bookings_live_slot ON bookings(slot_id)
  WHERE slot_id IS NOT NULL AND status IN ('awaiting_payment', 'confirmed', 'completed');

CREATE TABLE booking_events (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  at TEXT NOT NULL,
  actor TEXT NOT NULL,             -- user id, 'family', 'stripe', 'system'
  type TEXT NOT NULL,
  data TEXT
);
CREATE INDEX booking_events_booking ON booking_events(booking_id);

CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  booking_id TEXT,
  family_package_id TEXT,
  source TEXT NOT NULL CHECK (source IN ('stripe', 'offline')),
  kind TEXT NOT NULL DEFAULT 'charge' CHECK (kind IN ('charge', 'refund')),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  method TEXT,                     -- card, cash, venmo, zelle, check, other
  paid_on TEXT,
  status TEXT NOT NULL,            -- succeeded | pending | failed
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  note TEXT,
  recorded_by TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX payments_booking ON payments(booking_id);
CREATE INDEX payments_pi ON payments(stripe_payment_intent);
CREATE UNIQUE INDEX payments_stripe_session ON payments(stripe_session_id) WHERE kind = 'charge';

CREATE TABLE stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  received_at TEXT NOT NULL,
  result TEXT
);

CREATE TABLE packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  credits INTEGER,                 -- null = unlimited access for the validity period
  eligible_type_ids TEXT,          -- JSON array; null = all
  validity_days INTEGER,           -- null = no expiration
  billing TEXT NOT NULL DEFAULT 'one_time' CHECK (billing IN ('one_time')),
  pay_link TEXT,
  description TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE family_packages (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES families(id),
  package_id TEXT NOT NULL REFERENCES packages(id),
  snapshot TEXT NOT NULL,          -- JSON copy of the package terms at purchase
  status TEXT NOT NULL CHECK (status IN ('pending_payment', 'active', 'expired', 'void')),
  credits_total INTEGER,           -- null = unlimited
  purchased_at TEXT,
  expires_on TEXT,
  checkout_ref TEXT UNIQUE,
  created_by TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE credit_ledger (
  id TEXT PRIMARY KEY,
  family_package_id TEXT NOT NULL REFERENCES family_packages(id),
  booking_id TEXT,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,            -- purchase | redeem | restore | adjust
  idem_key TEXT UNIQUE,            -- prevents double redemption / restoration
  actor TEXT,
  note TEXT,
  at TEXT NOT NULL
);
CREATE INDEX credit_ledger_pkg ON credit_ledger(family_package_id);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  booking_id TEXT,
  kind TEXT NOT NULL,              -- request_received | confirmation | reminder | cancellation | reschedule | offer | test
  channel TEXT NOT NULL DEFAULT 'email',
  to_addr TEXT,
  subject TEXT,
  status TEXT NOT NULL,            -- queued | sent | failed | skipped
  detail TEXT,
  provider_id TEXT,
  dedupe_key TEXT UNIQUE,
  created_at TEXT NOT NULL,
  sent_at TEXT
);
CREATE INDEX notifications_booking ON notifications(booking_id);

CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  at TEXT NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  data TEXT
);
