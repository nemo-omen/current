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
}