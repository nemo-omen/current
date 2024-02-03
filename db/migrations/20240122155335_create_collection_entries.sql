-- database: ../../frosty.sqlite
-- migrate:up
CREATE TABLE IF NOT EXISTS
    collection_entries (
        entryId VARCHAR(255) NOT NULL,
        feedId VARCHAR(255) NOT NULL,
        collectionId INTEGER NOT NULL,
        FOREIGN KEY (entryId) REFERENCES entries (id) ON DELETE CASCADE,
        FOREIGN KEY (collectionId) REFERENCES collections (id) ON DELETE CASCADE PRIMARY KEY (entryId, collectionId)
    );

-- migrate:down
DROP TABLE IF EXISTS collection_entries;
