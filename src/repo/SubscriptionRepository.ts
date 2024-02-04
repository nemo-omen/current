import { Database } from 'bun:sqlite';
import { Result } from '../lib/types/Result';
import { PersistanceSubscriptionDTO, Subscription } from '../model/Subscription';
import { Repository } from './Repository';


export class SubscriptionRepository implements Repository<Subscription> {
  private _db: Database;

  constructor (db: Database) {
    this._db = db;
  }

  get db(): Database {
    return this._db;
  }

  create(subscription: Subscription): Result<Subscription> {
    const query = this._db.query(`
      INSERT INTO subscriptions (
        feedId,
        userId)
      VALUES ($feedId, $userId)
      ON CONFLICT(feedId, userId) DO NOTHING
      RETURNING *;
    `);

    let data: unknown;
    try {
      data = query.get({
        $feedId: subscription.feedId,
        $userId: subscription.userId
      });
    } catch (err) {
      console.error(err);
      return { ok: false, error: String(err) };
    }

    if (!data) {
      return { ok: false, error: "Error saving subscription to database" };
    }

    const sub: Subscription = Subscription.fromPersistance(data as PersistanceSubscriptionDTO);

    return { ok: true, data: sub };
  }

  getSubscriptionsByUserId(userId: number): Result<Subscription[]> {
    const query = this._db.query(`SELECT * FROM subscriptions WHERE userId=$userId`);

    let subResult: PersistanceSubscriptionDTO[];
    try {
      subResult = query.all({ $userId: userId }) as PersistanceSubscriptionDTO[];
    } catch (err) {
      return { ok: false, error: `Error getting user's subscriptions from database: ${err}` };
    }

    if (subResult === null || subResult.length === 0) {
      return { ok: true, data: [] };
    }

    return {
      ok: true,
      data: subResult.map(
        (sub) => Subscription.fromPersistance(sub)
      )
    };
  }

  getSubscriptionByFeedId(feedId: string): Result<Subscription | null> {
    const query = this._db.query(`SELECT * FROM subscriptions WHERE feedId=$feedId`);

    let subResult: PersistanceSubscriptionDTO | null;
    try {
      subResult = query.get({ $feedId: feedId }) as PersistanceSubscriptionDTO;
    } catch (err) {
      console.error(err);
      return { ok: false, error: `There was an error retrieving subscriptions for the feed ${feedId}` };
    }

    return {
      ok: true,
      data: Subscription.fromPersistance(subResult)
    };
  }

  delete(userId: number, feedId: string): Result<boolean> {
    type SubDelete = { userId: number, feedId: string; };
    const query = this._db.query(`DELETE FROM subscriptions WHERE userId=$userId AND feedId=$feedId RETURNING *;`);
    let deleteResult: SubDelete | undefined = undefined;
    try {
      deleteResult = query.get({ $userId: userId, $feedId: feedId }) as SubDelete;
    } catch (err) {
      console.error(`Error deleting subscription: ${err}`);
      return { ok: false, error: String(err) };
    }

    if (!deleteResult) {
      return { ok: false, error: `Something went wrong while deleting the subscription.` };
    }

    return { ok: true, data: true };
  }
}