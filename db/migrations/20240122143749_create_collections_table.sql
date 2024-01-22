-- database: ../../frosty.sqlite
-- migrate:up
CREATE TABLE IF NOT EXISTS
    collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    );

CREATE TRIGGER IF NOT EXISTS update_timestamp_before_update BEFORE
UPDATE ON collections BEGIN
UPDATE collections
SET
    updated = CURRENT_TIMESTAMP
WHERE
    id = old.id;

END;

-- migrate:down
DROP TABLE IF EXISTS collections;
