-- migrate:up
ALTER TABLE items ADD COLUMN author TEXT;
ALTER TABLE items ADD COLUMN contentEncoded TEXT;
ALTER TABLE items ADD COLUMN contentSnippet TEXT;
ALTER TABLE items ADD COLUMN enclosure JSON;

-- migrate:down
ALTER TABLE items DROP COLUMN author TEXT;
ALTER TABLE items DROP COLUMN contentEncoded TEXT;
ALTER TABLE items DROP COLUMN contentSnippet TEXT;
ALTER TABLE items DROP COLUMN enclosure JSON;
