-- database: ../../frosty.sqlite
-- migrate:up
CREATE TABLE IF NOT EXISTS
    subscriptions (
        userId INTEGER NOT NULL,
        feedId VARCHAR(255) NOT NULL,
        subscribedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (feedId) REFERENCES feeds (id) ON DELETE CASCADE,
        PRIMARY KEY (userId, feedId)
    );

-- migrate:down
DROP TABLE IF EXISTS subscriptions;
