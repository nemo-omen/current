import { Database, SQLQueryBindings } from 'bun:sqlite';
import { Result } from '../lib/types/Result';
import { CurrentFeed, CurrentFeedDTO, PersistanceFeedDTO } from '../model/CurrentFeed';
import { CurrentEntry, CurrentEntryDTO, PersistanceEntryDTO } from '../model/CurrentEntry';
import { Repository } from './Repository';


export type FeedInfo = {
  id: number,
  title: string,
  feedUrl: string;
};

export class FeedRepository implements Repository<CurrentFeed> {
  private _db: Database;
  feeds: CurrentFeed[];
  constructor (db: Database) {
    this._db = db;
    this.feeds = [];
  }

  get db(): Database {
    return this.db;
  }

  create(feed: CurrentFeed): Result<CurrentFeed> {
    const query = this._db.query(insertFeedQuery);
    let insertResult: PersistanceFeedDTO | undefined = undefined;
    try {
      insertResult = query.get(feedQueryValues(feed.toPersistance())) as PersistanceFeedDTO;
    } catch (err) {
      return { ok: false, error: String(err) };
    }

    if (!insertResult) {
      return { ok: false, error: 'There was an error saving the feed.' };
    }

    return { ok: true, data: feed };
  };

  update(feed: CurrentFeed): Result<CurrentFeed> {
    return { ok: false, error: 'Not implemented' };
  }

  delete(id: string): Result<boolean> {
    return { ok: false, error: 'Not implemented' };
  }

  findById(id: string): Result<CurrentFeed | null> {
    const query = this._db.query(
      `SELECT * FROM feeds
         WHERE id=$id
      `);
    let result: unknown = undefined;

    try {
      result = query.get({ $id: id });
    } catch (err) {
      return { ok: false, error: String(err) };
    }

    if (result) {
      return { ok: true, data: CurrentFeed.fromPersistance(result) };
    }

    return { ok: true, data: null };
  }

  findBySlug(slug: string): Result<CurrentFeed> {
    const query = this._db.query(`SELECT * FROM feeds WHERE slug=$slug`);
    let queryResult: PersistanceFeedDTO | undefined = undefined;
    try {
      queryResult = query.get({ $slug: slug }) as PersistanceFeedDTO;
    } catch (err) {
      return { ok: false, error: `Error getting feed: ${String(err)}` };
    }

    if (!queryResult) {
      return { ok: false, error: `Could not find feed with slug ${slug}` };
    }

    return { ok: true, data: CurrentFeed.fromPersistance(queryResult) };
  }

  findAll(): Result<CurrentFeed[]> {
    return { ok: false, error: 'Not implemented' };
  }

  /**
   * Queries the database of a feed with the given
   * feedLink and returns the feed if it exists.
   * @param feedLink URL of the feed
   * @returns Result<CurrentFeed | null>
   */
  findByUrl(feedLink: string): Result<CurrentFeed | null> {
    const query = this._db.query(
      `SELECT * FROM feeds
         WHERE feedLink=$feedLink
      `);
    let result: unknown = undefined;

    try {
      result = query.get({ $feedLink: feedLink });
    } catch (err) {
      return { ok: false, error: String(err) };
    }

    if (result) {
      return { ok: true, data: CurrentFeed.fromPersistance(result) };
    }

    return { ok: true, data: null };
  }
}

const insertFeedQuery = `
  INSERT INTO feeds (
          id,
          rssId,
          feedType,
          title,
          updated,
          description,
          feedLink,
          siteLink,
          categories,
          icon,
          logo,
          slug
        )
        VALUES (
          $id,
          $rssId,
          $feedType,
          $title,
          $updated,
          $description,
          $feedLink,
          $siteLink,
          $categories,
          $icon,
          $logo,
          $slug
        )
        ON CONFLICT (feedLink) DO NOTHING
        RETURNING id;
`;

const feedQueryValues = (feedDTO: PersistanceFeedDTO) => {
  return {
    $id: feedDTO.id,
    $rssId: feedDTO.rssId || null,
    $feedType: feedDTO.feedType || null,
    $title: feedDTO.title || null,
    $updated: feedDTO.updated || null,
    $description: feedDTO.description || null,
    $feedLink: feedDTO.feedLink || null,
    $siteLink: feedDTO.siteLink || null,
    $categories: feedDTO.categories || null,
    $icon: feedDTO.icon || null,
    $logo: feedDTO.logo || null,
    $slug: feedDTO.slug || null,
  };
};