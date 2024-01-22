-- migrate:up
CREATE TABLE IF NOT EXISTS collection_entries(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entryId INTEGER NOT NULL,
    collectionId INTEGER NOT NULL,
    FOREIGN KEY (entryId) REFERENCES entries (id) ON DELETE CASCADE,
    FOREIGN KEY (collectionId) REFERENCES collections (id) ON DELETE CASCADE
);

-- migrate:down
DROP TABLE IF EXISTS collection_entries;
