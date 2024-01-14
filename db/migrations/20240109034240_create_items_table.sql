-- database: ../../frosty.sqlite
-- migrate:up
CREATE TABLE IF NOT EXISTS
    items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        feedId INTEGER NOT NULL,
        title VARCHAR(255),
        author VARCHAR(255),
        description TEXT,
        link VARCHAR(255) UNIQUE NOT NULL,
        pubDate DATETIME,
        content TEXT,
        contentEncoded TEXT,
        contentSnippet TEXT,
        enclosure JSON,
        FOREIGN KEY (feedId) REFERENCES feeds (id) ON DELETE CASCADE
    );

-- migrate:down
DROP TABLE IF EXISTS items;
