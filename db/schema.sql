CREATE TABLE IF NOT EXISTS "schema_migrations" (version varchar(128) primary key);
CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        password TEXT
    );
CREATE TABLE sessions (id TEXT PRIMARY KEY, data TEXT);
CREATE TABLE feeds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255),
        description TEXT,
        feedUrl VARCHAR(255) UNIQUE NOT NULL,
        link VARCHAR(255),
        image JSON
    );
CREATE TABLE items (
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
CREATE TABLE subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        feedId INTEGER NOT NULL,
        subscribedDate DATE,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (feedId) REFERENCES feeds (id) ON DELETE CASCADE
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
  ('20240116125932');
