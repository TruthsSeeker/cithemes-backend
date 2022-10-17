BEGIN;
TRUNCATE playlist_entries CASCADE;
UPDATE cities
  SET hash = NULL,
    has_changed = TRUE WHERE playlist_id IS NOT NULL;
COMMIT;