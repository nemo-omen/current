import { Database } from 'bun:sqlite';
import { Result } from '../lib/types/Result';
import { RssFeed } from '../lib/types/RssFeed';
import { RssItem } from '../lib/types/RssItem';
import { StringerFeed, StringerFeedPersistDTO } from '../model/StringerFeed';
import { StringerEntry } from '../model/StringerEntry';
import type { StringerItemProps } from '../model/StringerEntry';

export type FeedInfo = {
  id: number,
  title: string,
  feedUrl: string;
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
    const res: StringerFeedPersistDTO[] = feedQuery.all() as StringerFeedPersistDTO[];
    for (const f of res) {
      const feed = StringerFeed.fromPersistance(f);
      const itemQuery = this._db.query(`SELECT * FROM items WHERE feedId=$feedId ORDER BY pubDate DESC;`);
      const itemsRes: RssItem[] | undefined = itemQuery.all({ $feedId: feed.id }) as RssItem[];

      if (itemsRes) {
        for (const item of itemsRes) {
          feed.items.push(new StringerEntry({ ...item, feedTitle: feed.title, feedImage: feed.image }));
        }
      }
      this.feeds.push(feed);
    }
    return this.feeds;
  }

  getFeedInfo(): Result<FeedInfo[]> {
    const query = this._db.query(`SELECT id, title, feedUrl FROM feeds;`);
    const res: FeedInfo[] = query.all() as FeedInfo[];
    return { ok: true, data: res };
  }

  getItemById(id: number): Result<StringerEntry> {
    const query = this._db.query(`SELECT * FROM items WHERE id=$id`);
    const queryResult = query.get({ $id: id });

    // console.log({ queryResult });

    if (queryResult) {
      return { ok: true, data: queryResult };
    }
    return { ok: false, error: "No item with that id" };
  }

  getAllItems(page = 1, limit = 100): Result<StringerEntry[]> {
    // const query = this._db.query(`
    //   SELECT * FROM items
    //   ORDER BY pubDate DESC
    //   LIMIT $limit OFFSET $offset
    //   `);
    const query = this._db.query(`
    SELECT * FROM items
      ORDER BY pubDate DESC
      LIMIT $limit OFFSET $offset;
    `);
    let queryResult;
    try {
      queryResult = query.all({ $limit: limit, $offset: limit * (page - 1) });
    } catch (err) {
      return { ok: false, error: "There was an error fetching your stories." };
    }

    const items = [];

    for (const rssItem of queryResult) {
      const feedQuery = this._db.query(`SELECT title, image FROM feeds WHERE id=$id`);
      const feedInfo = feedQuery.get({ $id: rssItem.feedId });
      const itemProps: StringerItemProps = {
        ...rssItem,
        enclosure: JSON.parse(rssItem.enclosure),
        feedTitle: feedInfo.title,
        feedImage: JSON.parse(feedInfo.image)
      };
      const item = new StringerEntry(itemProps);
      items.push(item);
    }

    const sorted = items.sort((a, b) => {
      return (new Date(b.pubDate).valueOf()) - (new Date(a.pubDate.valueOf()));
    });

    return { ok: true, data: sorted };
  }

  getTotalItemCount(): Result<number> {
    const query = this._db.query(`SELECT COUNT(*) FROM items;`);
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

  async saveFeed(rssFeed: RssFeed): Promise<Result<number[]>> {
    const insertFeedQuery = this._db.prepare(`
      INSERT INTO feeds ( title, feedUrl, description, link, image)
        VALUES ( $title, $feedUrl, $description, $link, $image )
        RETURNING id;
    `);

    const insertItemQuery = this._db.prepare(`
      INSERT INTO items (feedId, title, author, pubDate, description, link, content, contentEncoded, contentSnippet, enclosure)
        VALUES ($feedId, $title, $author, $pubDate, $description, $link, $content, $contentEncoded, $contentSnippet, $enclosure)
        RETURNING id;
    `);

    const insertFeedAndItems = this._db.transaction((rssFeed) => {
      const res = {
        feedId: undefined,
        itemIds: []
      };

      let feedInsertResult = undefined;
      try {
        feedInsertResult = insertFeedQuery.get({
          $title: rssFeed.title,
          $feedUrl: rssFeed.feedUrl,
          $description: rssFeed.description,
          $link: rssFeed.link,
          $image: JSON.stringify(rssFeed.image)
        });
      } catch (err) {
        console.error("insert feed error: ", err);
        // return { ok: false, error: String(err) };
      }

      if (feedInsertResult) {
        res.feedId = feedInsertResult.id;
      }

      for (const rssItem: RssItem of rssFeed.items) {
        let itemResult = undefined;
        try {
          itemResult = insertItemQuery.get({
            $feedId: feedInsertResult.id,
            $title: rssItem.title,
            $author: rssItem.author,
            $pubDate: rssItem.pubDate,
            $description: rssItem.description,
            $link: rssItem.link,
            $content: rssItem.content,
            $contentEncoded: rssItem["content:encoded"],
            $contentSnippet: rssItem.contentSnippet,
            $enclosure: JSON.stringify(rssItem.enclosure)
          });
        } catch (err) {
          return { ok: false, error: String(err) };
        }

        if (itemResult) {
          res.itemIds.push(itemResult.id);
        }
      }
      return { ok: true, data: res };
    });

    const insertResult = insertFeedAndItems(rssFeed);

    return { ok: true, data: insertResult };
  };

  insertItem(rssItem: RssItem, feedId: number): Result<number | null> {
    const insertItemQuery = this._db.query(`
      INSERT INTO items (feedId, title, author, pubDate, description, link, content, contentEncoded, contentSnippet, enclosure)
        VALUES ($feedId, $title, $author, $pubDate, $description, $link, $content, $contentEncoded, $contentSnippet, $enclosure)
        ON CONFLICT DO NOTHING
        RETURNING id;
    `);

    let itemResult = undefined;
    try {
      itemResult = insertItemQuery.get({
        $feedId: feedId,
        $title: rssItem.title,
        $author: rssItem.author,
        $pubDate: rssItem.pubDate,
        $description: rssItem.description,
        $link: rssItem.link,
        $content: rssItem.content,
        $contentEncoded: rssItem["content:encoded"],
        $contentSnippet: rssItem.contentSnippet,
        $enclosure: JSON.stringify(rssItem.enclosure)
      });
    } catch (err) {
      return { ok: false, error: String(err) };
    }
    if (itemResult) {
      return { ok: true, data: itemResult.id };
    } else {
      return { ok: true, data: null };
    }
  }
}