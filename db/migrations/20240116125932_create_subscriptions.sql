-- database: ../../frosty.sqlite
-- migrate:up
CREATE TABLE IF NOT EXISTS
    subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        feedId VARCHAR(255) NOT NULL,
        subscribedDate DATE,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (feedId) REFERENCES feeds (id) ON DELETE CASCADE
    );

-- migrate:down
DROP TABLE IF EXISTS subscriptions;
