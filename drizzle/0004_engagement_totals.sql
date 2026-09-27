CREATE TABLE IF NOT EXISTS engagement_totals (
  day TEXT NOT NULL,
  event TEXT NOT NULL CHECK(event IN ('place_view','map_open','save','review','share')),
  country TEXT NOT NULL CHECK(country IN ('KR','US')),
  source TEXT NOT NULL CHECK(source IN ('direct','instagram','google','other')),
  total INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(day,event,country,source)
);
