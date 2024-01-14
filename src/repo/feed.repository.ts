import { Database } from 'bun:sqlite';
import { Result } from '../lib/interfaces/Result';
import { RssFeed } from '../lib/interfaces/RssFeed';
import { RssItem } from '../lib/interfaces/RssItem';
import { StringerFeed } from '../model/StringerFeed';
import { StringerItem } from '../model/StringerItem';
import type { StringerItemProps } from '../model/StringerItem';

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
    const res = feedQuery.all();
    for (const f of res) {
      const feed = new StringerFeed(
        f.id,
        f.title,
        f.feedUrl,
        f.description,
        f.link,
        f.image,
        []
      );
      const itemQuery = this._db.query(`SELECT * FROM items WHERE feedId=$feedId ORDER BY pubDate DESC;`);
      const itemsRes: RssItem[] | undefined = itemQuery.all({ $feedId: feed.id }) as RssItem[];

      if (itemsRes) {
        for (const item of itemsRes) {
          feed.items.push(new StringerItem({ ...item, feedTitle: feed.title, feedImage: feed.image }));
        }
      }
      this.feeds.push(feed);
    }
    // for (const feedRes of res) {
    //   const f = new Feed(feedRes);
    // }
    // console.log(this.feeds);
    return this.feeds;
  }

  getAllItems(page = 1, limit = 50): Result {
    // const query = this._db.query(`
    //   SELECT * FROM items
    //   ORDER BY pubDate DESC
    //   LIMIT $limit OFFSET $offset
    //   `);
    const query = this._db.query(`
    SELECT * FROM items
      ORDER BY pubDate DESC;
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
      const itemProps = { ...rssItem, enclosure: JSON.parse(rssItem.enclosure), feedTitle: feedInfo.title, feedImage: JSON.parse(feedInfo.image) };
      const item = new StringerItem(itemProps);
      items.push(item);
    }

    const sorted = items.sort((a, b) => {
      return (new Date(b.pubDate).valueOf()) - (new Date(a.pubDate.valueOf()));
    });

    return { ok: true, data: sorted };
  }

  getTotalItemCount(): Result {
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

  async saveFeed(rssFeed: RssFeed): Promise<Result> {
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
}