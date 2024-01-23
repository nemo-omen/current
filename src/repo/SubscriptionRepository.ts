import { Database } from 'bun:sqlite';
import { Result } from '../lib/types/Result';
import { Subscription } from '../lib/types/Subscription';

export class SubscriptionRepository {
  private _db: Database;

  constructor (db: Database) {
    this._db = db;
  }

  getUserSubscriptions(userId: number): Result<Subscription[]> {
    const query = this._db.query(`SELECT * FROM subscriptions WHERE userId=$userId`);
    const subResult: Subscription[] = query.all({ $userId: userId }) as Subscription[];
    if (!subResult) {
      return { ok: false, error: "Error getting subscriptions from database" };
    }
    return { ok: true, data: subResult };
  }

  saveSubscription(feedId: string, userId: number) {
    const query = this._db.query(`
      INSERT INTO subscriptions (
        feedId,
        userId)
      VALUES ($feedId, $userId)
      RETURNING id
    `);
    let data: unknown;
    try {
      data = query.get({ $feedId: feedId, $userId: userId });
    } catch (err) {
      return { ok: false, error: String(err) };
    }
    return { ok: true, data: data };
  }
}