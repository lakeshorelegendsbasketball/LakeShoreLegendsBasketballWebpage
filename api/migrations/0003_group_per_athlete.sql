-- Group sessions are priced per athlete: each family pays for its own athlete.
UPDATE session_types SET pricing_basis = 'athlete' WHERE id IN ('p2', 'p3', 'p4');
