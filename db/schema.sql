CREATE TABLE IF NOT EXISTS "schema_migrations" (version varchar(128) primary key);
CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        password TEXT
    );
CREATE TABLE sessions (id TEXT PRIMARY KEY, data TEXT);
CREATE TABLE feeds (
        id VARCHAR(255) PRIMARY KEY,
        feedType VARCHAR(255),
        title VARCHAR(255),
        updated DATE,
        description TEXT,
        feedLink VARCHAR(255) UNIQUE NOT NULL,
        siteLink VARCHAR(255),
        icon JSON,
        logo JSON
    );
CREATE TABLE entries (
        id VARCHAR(255) PRIMARY KEY,
        feedId VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        updated DATETIME,
        published DATETIME,
        authors JSON,
        description TEXT,
        content JSON,
        links JSON,
        categories JSON,
        FOREIGN KEY (feedId) REFERENCES feeds (id) ON DELETE CASCADE
    );
CREATE TABLE subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        feedId VARCHAR(255) NOT NULL,
        subscribedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (feedId) REFERENCES feeds (id) ON DELETE CASCADE
    );
CREATE TABLE collection_entries(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entryId INTEGER NOT NULL,
    collectionId INTEGER NOT NULL,
    FOREIGN KEY (entryId) REFERENCES entries (id) ON DELETE CASCADE,
    FOREIGN KEY (collectionId) REFERENCES collections (id) ON DELETE CASCADE
);
-- Dbmate schema migrations
INSERT INTO "schema_migrations" (version) VALUES
  ('20240106141030'),
  ('20240109033646'),
  ('20240109034240'),
  ('20240110131659'),
  ('20240110133129'),
  ('20240113231019'),
  ('20240113232153'),
  ('20240116125932'),
  ('20240122143749'),
  ('20240122155335');
