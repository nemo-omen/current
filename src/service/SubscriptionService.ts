import { Database } from 'bun:sqlite';
import { FeedRepository } from '../repo/FeedRepository';
import { EntryRepository } from '../repo/EntryRepository';
import { CurrentFeed, PersistanceFeedDTO } from '../model/CurrentFeed';
import { Result } from '../lib/types/Result';
import { CurrentEntry, PersistanceEntryDTO } from '../model/CurrentEntry';
import { SubscriptionRepository } from '../repo/SubscriptionRepository';
import { Subscription } from '../model/Subscription';


export class SubscriptionService {
  _db: Database;
  feedRepo: FeedRepository;
  entryRepo: EntryRepository;
  subscriptionRepo: SubscriptionRepository;


  constructor (db: Database) {
    this._db = db;
    this.feedRepo = new FeedRepository(this._db);
    this.entryRepo = new EntryRepository(this._db);
    this.subscriptionRepo = new SubscriptionRepository(this._db);

  }

  getUnreadSubscriptionEntries(userId: number): Result<CurrentEntry[]> {
    const subscriptionsResult = this.subscriptionRepo.getSubscriptionsByUserId(userId);
    if (!subscriptionsResult.ok) {
      return subscriptionsResult;
    }

    for (const subscription of subscriptionsResult.data) {
      // const feedsResult = this.feedRepo.
    }
    return { ok: true, data: [] };
  }

  saveSubscriptionFeedEntries(feed: CurrentFeed, userId: number): Result<CurrentFeed> {
    const insertAll = this._db.transaction((transactionFeed: CurrentFeed) => {
      const feedResult: Result<CurrentFeed> = this.feedRepo.create(feed);

      if (!feedResult.ok) {
        return feedResult;
      }

      for (const entry of feed.entries) {
        const entryResult = this.entryRepo.create(entry);
        if (!entryResult.ok) {
          return entryResult;
        }
      }

      const subscriptionResult = this.subscriptionRepo.create(new Subscription({ feedId: feedResult.data.id, userId }));
      if (!subscriptionResult.ok) {
        return subscriptionResult;
      }

    });

    try {
      insertAll(feed);
    } catch (err) {
      console.error(err);
      return { ok: false, error: String(err) };
    }

    return { ok: true, data: feed };
  }
}