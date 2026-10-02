CREATE TABLE place_contributions (
 id TEXT PRIMARY KEY, actor TEXT NOT NULL, place_id TEXT NOT NULL,
 note TEXT NOT NULL, source_url TEXT NOT NULL DEFAULT '', photo_url TEXT NOT NULL DEFAULT '',
 rights_consent INTEGER NOT NULL DEFAULT 0 CHECK(rights_consent IN (0,1)),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','reviewed','dismissed')),
 created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
 CHECK(photo_url='' OR rights_consent=1)
);
CREATE INDEX place_contributions_queue ON place_contributions(status,updated_at);
