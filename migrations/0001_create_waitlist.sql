-- Waitlist signups. Emails are stored trimmed and lowercased, so the primary key also deduplicates.
CREATE TABLE waitlist (
  email TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
