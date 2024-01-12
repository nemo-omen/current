import { Database } from 'bun:sqlite';
import { Feed } from '../model/Feed';
import { Result } from '../lib/interfaces/Result';
import { FeedItem } from '../model/FeedItem';

export class SQLiteFeedRepository {
  private _db: Database;
  feeds: Feed[];
  constructor (db: Database) {
    this._db = db;
    this.feeds = [];
  }

  getFeeds() {
    const query = this._db.query(`SELECT * FROM feeds;`);
    const res = query.all();
    // console.log({ res });
    // for (const feedRes of res) {
    //   const f = new Feed(feedRes);
    // }
    return this.feeds;
  }

  saveFeed(feed: Feed): Result {

    return { ok: true, data: feed };
  }

  saveItem(item: FeedItem): Result {

    return { ok: true, data: item };
  }
}