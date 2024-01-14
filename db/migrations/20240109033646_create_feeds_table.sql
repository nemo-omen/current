-- database: ../../frosty.sqlite
-- migrate:up
CREATE TABLE IF NOT EXISTS
    feeds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255),
        description TEXT,
        feedUrl VARCHAR(255) UNIQUE NOT NULL,
        link VARCHAR(255),
        image JSON
    );

-- migrate:down
DROP TABLE IF EXISTS feeds;
