-- Current session types and locations from the live site (same ids, so the
-- one-time import of the old data links to them instead of duplicating).
INSERT OR IGNORE INTO session_types (id, name, size, duration, min_participants, max_participants, pricing_basis, pay_link, booking_mode, active, sort, created_at, updated_at) VALUES
  ('p1', '60 Minute Private Training', '1-on-1', 60, 1, 1, 'group', 'https://buy.stripe.com/00w9AM0rxcFigGc4M10Jq01', 'immediate', 1, 0, '2026-09-24T00:00:00Z', '2026-09-24T00:00:00Z'),
  ('p2', '60 Minute 2-on-1 Training', '2-on-1', 60, 2, 2, 'group', 'https://buy.stripe.com/28E9AMcaf48Mdu03HX0Jq00', 'immediate', 1, 1, '2026-09-24T00:00:00Z', '2026-09-24T00:00:00Z'),
  ('p3', '60 Minute 3-on-1 Training', '3-on-1', 60, 3, 3, 'group', 'https://buy.stripe.com/8x2dR20rx9t64XuguJ0Jq02', 'immediate', 1, 2, '2026-09-24T00:00:00Z', '2026-09-24T00:00:00Z'),
  ('p4', '60 Minute 4+ Player Training', '4+ players', 60, 4, 10, 'group', 'https://buy.stripe.com/14AcMYdejaxa89GemB0Jq03', 'immediate', 1, 3, '2026-09-24T00:00:00Z', '2026-09-24T00:00:00Z');

INSERT OR IGNORE INTO locations (id, name, active, sort, created_at, updated_at) VALUES
  ('pr', 'Park Ridge, IL', 1, 0, '2026-09-24T00:00:00Z', '2026-09-24T00:00:00Z'),
  ('mun', 'Mundelein, IL', 1, 1, '2026-09-24T00:00:00Z', '2026-09-24T00:00:00Z');
