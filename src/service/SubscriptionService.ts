import { Database } from 'bun:sqlite';
import { FeedRepository } from '../repo/FeedRepository';
import { EntryRepository } from '../repo/EntryRepository';
import { CurrentFeed } from '../model/CurrentFeed';
import { Result } from '../lib/types/Result';
import { CurrentEntry } from '../model/CurrentEntry';
import { SubscriptionRepository } from '../repo/SubscriptionRepository';
import { Subscription } from '../model/Subscription';
import { CollectionRepository } from '../repo/CollectionRepository';
import { Collection } from '../model/Collection';

export class SubscriptionService {
  _db: Database;
  feedRepo: FeedRepository;
  entryRepo: EntryRepository;
  subscriptionRepo: SubscriptionRepository;
  collectionRepo: CollectionRepository;


  constructor (db: Database) {
    this._db = db;
    this.feedRepo = new FeedRepository(this._db);
    this.entryRepo = new EntryRepository(this._db);
    this.subscriptionRepo = new SubscriptionRepository(this._db);
    this.collectionRepo = new CollectionRepository(this._db);
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
      const savedEntryIds: string[] = [];

      if (!feedResult.ok) {
        return feedResult;
      }

      for (const entry of feed.entries) {
        const entryResult: Result<string> = this.entryRepo.create(entry);

        if (!entryResult.ok) {
          console.log(`Error saving entry: ${entryResult.error}`);
          return entryResult;
        }

        savedEntryIds.push(entryResult.data);
      }

      const subscriptionResult = this.subscriptionRepo.create(new Subscription({ feedId: feedResult.data.id, userId }));
      if (!subscriptionResult.ok) {
        console.log(`Failed saving subscription: ${subscriptionResult.error}`);
        return subscriptionResult;
      }

      const unreadCollectionResult = this.collectionRepo.findUserCollectionByTitle(userId, 'Unread');
      if (!unreadCollectionResult.ok) {
        console.log(`Unread collection result error: ${unreadCollectionResult.error}`);
        return unreadCollectionResult;
      }

      for (const entryId of savedEntryIds) {
        const savedUnreadResult = this.collectionRepo.addEntry(entryId, unreadCollectionResult.data.id!);
        if (!savedUnreadResult.ok) {
          // not sure what to do here
        }
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