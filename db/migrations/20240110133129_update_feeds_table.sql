-- migrate:up
ALTER TABLE feeds ADD COLUMN image JSON;

-- migrate:down
ALTER TABLE feeds DROP COLUMN image;
