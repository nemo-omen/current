-- database: ../../frosty.sqlite
-- migrate:up
CREATE TABLE IF NOT EXISTS
    entries (
        id VARCHAR(255) PRIMARY KEY,
        feedId VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        updated DATETIME,
        published DATETIME,
        authors JSON,
        content JSON,
        links JSON,
        summary TEXT,
        categories JSON,
        FOREIGN KEY (feedId) REFERENCES feeds (id) ON DELETE CASCADE
    );

-- migrate:down
DROP TABLE IF EXISTS entries;
