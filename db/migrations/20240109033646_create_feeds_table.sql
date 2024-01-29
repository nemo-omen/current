-- database: ../../frosty.sqlite
-- migrate:up
CREATE TABLE IF NOT EXISTS
    feeds (
        id VARCHAR(255) PRIMARY KEY,
        rssId VARCHAR(255),
        feedType VARCHAR(255),
        title VARCHAR(255),
        updated DATE,
        description TEXT,
        feedLink VARCHAR(255) UNIQUE NOT NULL,
        siteLink VARCHAR(255),
        categories JSON,
        icon JSON,
        logo JSON,
        slug VARCHAR(255) UNIQUE NOT NULL
    );

-- migrate:down
DROP TABLE IF EXISTS feeds;
