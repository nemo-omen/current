import { Database } from 'bun:sqlite';
import { Feed } from '../model/Feed';
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
}