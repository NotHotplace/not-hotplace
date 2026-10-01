CREATE TABLE IF NOT EXISTS campaign_totals (
 day TEXT NOT NULL,
 event TEXT NOT NULL CHECK(event IN ('place_view','map_open','save','review','share','guide_view','recommendation_open')),
 country TEXT NOT NULL CHECK(country IN ('KR','US')),
 source TEXT NOT NULL CHECK(source IN ('direct','instagram','google','other')),
 campaign TEXT NOT NULL CHECK(campaign IN ('none','brand','seoul_solo','cheongju_slow','private_room','spa','waterside','temple','us_slow','review','photo_guides','finder','weekend')),
 total INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(day,event,country,source,campaign)
);
