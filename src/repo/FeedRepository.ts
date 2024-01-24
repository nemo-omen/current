import { Database, SQLQueryBindings } from 'bun:sqlite';
import { Result } from '../lib/types/Result';
import { StringerFeed, StringerFeedDTO, PersistanceFeedDTO } from '../model/StringerFeed';
import { StringerEntry, StringerEntryDTO, PersistanceEntryDTO } from '../model/StringerEntry';


export type FeedInfo = {
  id: number,
  title: string,
  feedUrl: string;
};

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
          logo
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
          $logo
        )
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
    $logo: feedDTO.logo || null
  };
};

const insertEntryQuery = `
          INSERT INTO entries (
          id,
          rssId,
          feedId,
          title,
          updated,
          published,
          authors,
          content,
          links,
          summary,
          categories,
          media,
          feedTitle,
          feedLogo,
          feedIcon
        )
        VALUES (
          $id,
          $rssId,
          $feedId,
          $title,
          $updated,
          $published,
          $authors,
          $content,
          $links,
          $summary,
          $categories,
          $media,
          $feedTitle,
          $feedLogo,
          $feedIcon
        )
        RETURNING id;
`;


const entryQueryValues = (entryDTO: PersistanceEntryDTO) => {
  return {
    $id: entryDTO.id,
    $rssId: entryDTO.rssId || null,
    $feedId: entryDTO.feedId || null,
    $title: entryDTO.title || null,
    $updated: entryDTO.updated || null,
    $published: entryDTO.published || null,
    $authors: entryDTO.authors || null,
    $content: entryDTO.content || null,
    $links: entryDTO.links || null,
    $summary: entryDTO.summary || null,
    $categories: entryDTO.categories || null,
    $media: entryDTO.media || null,
    $feedTitle: entryDTO.feedTitle || null,
    $feedLogo: entryDTO.feedLogo || null,
    $feedIcon: entryDTO.feedIcon || null
  };
};

export class SQLiteFeedRepository {
  private _db: Database;
  feeds: StringerFeed[];
  constructor (db: Database) {
    this._db = db;
    this.feeds = [];
  }

  getFeeds(): StringerFeed[] {
    const feedQuery = this._db.query(`
      SELECT * FROM feeds;
    `);
    const res: StringerFeedDTO[] = feedQuery.all() as StringerFeedDTO[];
    for (const f of res) {
      const feed = StringerFeed.fromPersistance(f);
      const entryQuery = this._db.query(
        `SELECT * FROM entries
           WHERE feedId=$feedId
           ORDER BY published DESC;`
      );
      const entryRes: StringerEntryDTO[] | undefined = entryQuery.all(
        { $feedId: feed.id }
      ) as StringerEntryDTO[];

      if (entryRes) {
        for (const entry of entryRes) {
          feed.entries.push(StringerEntry.fromPersistance(entry));
        }
      }
      this.feeds.push(feed);
    }
    return this.feeds;
  }

  getFeedById(id: string): Result<StringerFeed | null> {
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
      return { ok: true, data: StringerFeed.fromPersistance(result) };
    }

    return { ok: true, data: null };
  }

  /**
   * Queries the database of a feed with the given
   * feedLink and returns the feed if it exists.
   * @param feedLink URL of the feed
   * @returns Result<StringerFeed | null>
   */
  getFeedByUrl(feedLink: string): Result<StringerFeed | null> {
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
      return { ok: true, data: StringerFeed.fromPersistance(result) };
    }

    return { ok: true, data: null };
  }

  // TODO: Remove?
  getFeedInfo(): Result<FeedInfo[]> {
    const query = this._db.query(`SELECT id, title, feedUrl FROM feeds;`);
    const res: FeedInfo[] = query.all() as FeedInfo[];
    return { ok: true, data: res };
  }

  getEntryById(id: number): Result<StringerEntry> {
    const query = this._db.query(`
      SELECT * FROM items
        WHERE id=$id
      `);
    const queryResult = query.get({ $id: id }) as StringerEntryDTO;

    if (queryResult) {
      return {
        ok: true,
        data: StringerEntry.fromPersistance(queryResult)
      };
    }
    return { ok: false, error: "No item with that id" };
  }

  getEntriesByFeedId(feedId: string): Result<StringerEntry[]> {
    const query = this._db.query(`
      SELECT * FROM entries
        WHERE feedId=$feedId
        ORDER BY published DESC;
    `);
    const queryResult = query.all({ $feedId: feedId }) as StringerEntryDTO[];

    const items = [];

    for (const entryDTO of queryResult) {
      const item = StringerEntry.fromPersistance(entryDTO);
      items.push(item);
    }

    return { ok: true, data: items };
  }

  getAllEntries(page = 1, limit = 100): Result<StringerEntry[]> {
    const query = this._db.query(`
    SELECT * FROM entries
      ORDER BY published DESC
      LIMIT $limit OFFSET $offset;
    `);

    let queryResult;
    try {
      queryResult = query.all({
        $limit: limit,
        $offset: limit * (page - 1)
      }) as StringerEntryDTO[];
    } catch (err) {
      return {
        ok: false,
        error: String(err)
      };
    }

    const items = [];

    for (const entryDTO of queryResult) {
      const item = StringerEntry.fromPersistance(entryDTO);
      items.push(item);
    }

    const sorted = items.sort((a, b) => {
      return (new Date(b.published!).valueOf()) - (new Date(a.published!).valueOf());
    });

    return { ok: true, data: sorted };
  }

  getTotalItemCount(): Result<number> {
    const query = this._db.query(`SELECT COUNT(*) FROM entries;`);
    let countResult;
    try {
      countResult = query.get();
    } catch (err) {
      return { ok: false, error: String(err) };
    }
    if (!countResult) {
      return { ok: true, data: 0 };
    }
    return { ok: true, data: countResult["COUNT(*)"] };
  }

  async insertFeed(feedDTO: PersistanceFeedDTO): Promise<Result<string[]>> {
    const feedQuery = this._db.prepare(insertFeedQuery);
    const entryQuery = this._db.prepare(insertEntryQuery);

    const insertFeedAndEntries = this._db.transaction(
      (feedDTO) => {
        const res = {
          feedId: undefined,
          itemIds: []
        };

        let feedInsertResult = undefined;
        try {
          const feedQueryVals = feedQueryValues(feedDTO);
          feedInsertResult = feedQuery.get(feedQueryVals);
        } catch (err) {
          console.error("insert feed error: ", err);
          return { ok: false, error: String(err) };
        }

        for (const entryDTO of feedDTO.entries) {
          let entryResult = undefined;
          try {
            const entryQueryVals = entryQueryValues(entryDTO);
            entryResult = entryQuery.get(entryQueryVals);
          } catch (err) {
            console.error("insert entry error: ", err);
            return { ok: false, error: String(err) };
          }

          if (entryResult) {
            res.itemIds.push(entryResult.id);
          }
        }
        return { ok: true, data: res };
      });

    const insertResult = insertFeedAndEntries(feedDTO);

    return { ok: true, data: insertResult };
  };

  insertEntry(entryDTO: StringerEntryDTO): Result<number | null> {
    const entryQuery = this._db.query(insertEntryQuery);

    let entryResult = undefined;
    try {
      const entryQueryVals = entryQueryValues(entryDTO);
      entryResult = entryQuery.get(entryQueryVals);
    } catch (err) {
      return { ok: false, error: String(err) };
    }
    if (entryResult) {
      return { ok: true, data: entryResult.id };
    } else {
      return { ok: true, data: null };
    }
  }
};