-- Anonymous reactions are deliberately separate from authenticated reviews.
CREATE TABLE IF NOT EXISTS quick_feedback (
 actor TEXT NOT NULL, place_id TEXT NOT NULL,
 noise TEXT NOT NULL CHECK(noise IN ('조용함','보통','시끄러움')),
 day TEXT CHECK(day IN ('평일','주말·공휴일')),
 time TEXT CHECK(time IN ('오전','오후','저녁')),
 updated_at INTEGER NOT NULL,
 PRIMARY KEY(actor,place_id)
);
CREATE INDEX IF NOT EXISTS quick_feedback_place_date ON quick_feedback(place_id,updated_at);
CREATE TABLE IF NOT EXISTS quick_feedback_settings (name TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS quick_feedback_limits (day TEXT NOT NULL,actor TEXT NOT NULL,total INTEGER NOT NULL,PRIMARY KEY(day,actor));
-- Preserve existing totals while allowing the new country and funnel actions.
CREATE TABLE engagement_totals_v2 (
 day TEXT NOT NULL,event TEXT NOT NULL CHECK(event IN ('place_view','map_open','save','review','share','review_start','review_login','quick_review','journal_open')),
 country TEXT NOT NULL CHECK(country IN ('KR','US','JP')),
 source TEXT NOT NULL CHECK(source IN ('direct','instagram','google','other')),
 total INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(day,event,country,source)
);
INSERT INTO engagement_totals_v2 SELECT * FROM engagement_totals;
DROP TABLE engagement_totals;
ALTER TABLE engagement_totals_v2 RENAME TO engagement_totals;
CREATE TABLE campaign_totals_v2 (
 day TEXT NOT NULL,event TEXT NOT NULL CHECK(event IN ('place_view','map_open','save','review','share','guide_view','recommendation_open','review_start','review_login','quick_review','journal_open')),
 country TEXT NOT NULL CHECK(country IN ('KR','US','JP')),
 source TEXT NOT NULL CHECK(source IN ('direct','instagram','google','other')),
 campaign TEXT NOT NULL CHECK(campaign IN ('none','brand','seoul_solo','cheongju_slow','private_room','spa','waterside','temple','us_slow','review','photo_guides','finder','weekend')),
 total INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(day,event,country,source,campaign)
);
INSERT INTO campaign_totals_v2 SELECT * FROM campaign_totals;
DROP TABLE campaign_totals;
ALTER TABLE campaign_totals_v2 RENAME TO campaign_totals;
