-- Preserve existing totals and contributor data while expanding country coverage.
CREATE TABLE engagement_totals_world (
 day TEXT NOT NULL,event TEXT NOT NULL CHECK(event IN ('place_view','map_open','save','review','share','review_start','review_login','quick_review','journal_open')),
 country TEXT NOT NULL CHECK(length(country)=2 AND country GLOB '[A-Z][A-Z]'),
 source TEXT NOT NULL CHECK(source IN ('direct','instagram','google','other')),
 total INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(day,event,country,source)
);
INSERT INTO engagement_totals_world SELECT * FROM engagement_totals;
DROP TABLE engagement_totals;
ALTER TABLE engagement_totals_world RENAME TO engagement_totals;
CREATE TABLE campaign_totals_world (
 day TEXT NOT NULL,event TEXT NOT NULL CHECK(event IN ('place_view','map_open','save','review','share','guide_view','recommendation_open','review_start','review_login','quick_review','journal_open')),
 country TEXT NOT NULL CHECK(length(country)=2 AND country GLOB '[A-Z][A-Z]'),
 source TEXT NOT NULL CHECK(source IN ('direct','instagram','google','other')),
 campaign TEXT NOT NULL CHECK(campaign IN ('none','brand','seoul_solo','cheongju_slow','private_room','spa','waterside','temple','us_slow','review','photo_guides','finder','weekend')),
 total INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(day,event,country,source,campaign)
);
INSERT INTO campaign_totals_world SELECT * FROM campaign_totals;
DROP TABLE campaign_totals;
ALTER TABLE campaign_totals_world RENAME TO campaign_totals;

CREATE TABLE contributor_profiles_world (
 user_id TEXT PRIMARY KEY,
 id TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL,
 region TEXT NOT NULL,
 country TEXT NOT NULL CHECK(length(country)=2 AND country GLOB '[A-Z][A-Z]'),
 link TEXT NOT NULL DEFAULT '',
 bio TEXT NOT NULL DEFAULT '',
 consent INTEGER NOT NULL DEFAULT 0 CHECK(consent IN (0,1)),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 reason TEXT NOT NULL DEFAULT '',
 updated_at INTEGER NOT NULL
);
CREATE TABLE contributor_collections_world (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL,
 title TEXT NOT NULL,
 country TEXT NOT NULL CHECK(length(country)=2 AND country GLOB '[A-Z][A-Z]'),
 region TEXT NOT NULL,
 place_ids TEXT NOT NULL,
 note TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 reason TEXT NOT NULL DEFAULT '',
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL
);

INSERT INTO contributor_profiles_world SELECT * FROM contributor_profiles;
INSERT INTO contributor_collections_world SELECT * FROM contributor_collections;
DROP TABLE contributor_profiles;
DROP TABLE contributor_collections;
ALTER TABLE contributor_profiles_world RENAME TO contributor_profiles;
ALTER TABLE contributor_collections_world RENAME TO contributor_collections;
CREATE INDEX contributor_collections_queue ON contributor_collections(status,updated_at);
