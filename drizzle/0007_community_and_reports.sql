CREATE TABLE place_reports (
 id TEXT PRIMARY KEY,
 actor TEXT NOT NULL,
 place_id TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('location','hours','parking','closed','conditions')),
 note TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','resolved','dismissed')),
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL,
 UNIQUE(actor,place_id,kind)
);
CREATE INDEX place_reports_queue ON place_reports(status,updated_at);
CREATE TABLE contributor_profiles (
 user_id TEXT PRIMARY KEY,
 id TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL,
 region TEXT NOT NULL,
 country TEXT NOT NULL CHECK(country IN ('KR','US','JP')),
 link TEXT NOT NULL DEFAULT '',
 bio TEXT NOT NULL DEFAULT '',
 consent INTEGER NOT NULL DEFAULT 0 CHECK(consent IN (0,1)),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 reason TEXT NOT NULL DEFAULT '',
 updated_at INTEGER NOT NULL
);
CREATE TABLE contributor_collections (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL,
 title TEXT NOT NULL,
 country TEXT NOT NULL CHECK(country IN ('KR','US','JP')),
 region TEXT NOT NULL,
 place_ids TEXT NOT NULL,
 note TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 reason TEXT NOT NULL DEFAULT '',
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL
);
CREATE INDEX contributor_collections_queue ON contributor_collections(status,updated_at);
