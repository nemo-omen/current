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

  saveStoredFeedSubscription(feedId: string, userId: number): Result<boolean> {
    // console.log(`Attempting to save subscription for feed ${feedId} and user ${userId}`);
    const transact = this._db.transaction((tsFeedId: string, tsUserId: number) => {
      const storedFeedResult = this.feedRepo.findById(feedId);
      if (!storedFeedResult.ok) {
        return storedFeedResult;
      }

      if (storedFeedResult.data) {
        console.log(`Found stored feed ${storedFeedResult.data.id}. Storing subscription`);
        const subscriptionResult = this.subscriptionRepo.create(new Subscription({ feedId: tsFeedId, userId: tsUserId }));
        if (!subscriptionResult.ok) {
          // console.log(`Failed saving subscription: ${subscriptionResult.error}`);
          return subscriptionResult;
        }

        // console.log(`Subscription stored. Finding 'Unread' collection`);

        const unreadCollectionResult = this.collectionRepo.findUserCollectionByTitle(userId, 'Unread');
        if (!unreadCollectionResult.ok) {
          // console.log(`Unread collection result error: ${unreadCollectionResult.error}`);
          return unreadCollectionResult;
        }

        // console.log(`Selecting stored feed entries.`);
        const storedFeedEntriesResult = this.entryRepo.findByFeedId(tsFeedId);

        if (!storedFeedEntriesResult.ok) {
          console.log(`No entries to save.`);
          return { ok: false, error: 'Could not find entries to add to unread collection of new subscription.' };
        }

        // console.log(`Found 'Unread' collection with id ${unreadCollectionResult.data.id}. Adding ${storedFeedEntriesResult.data.length} entries.`);

        for (const entry of storedFeedEntriesResult.data) {
          // console.log(`Saving entry ${entry.id} from feed ${tsFeedId} to collection ${unreadCollectionResult.data.id}`);
          const savedUnreadResult = this.collectionRepo.addEntry(entry.id, tsFeedId, unreadCollectionResult.data.id!);
          if (!savedUnreadResult.ok) {
            // console.log({ savedUnreadResult });
            // not sure what to do here
          }
        }
      }
    });

    try {
      transact(feedId, userId);
    } catch (err) {
      console.error(err);
      return { ok: false, error: String(err) };
    }

    return { ok: true, data: true };
  }

  saveSubscriptionFeedEntries(feed: CurrentFeed, userId: number): Result<CurrentFeed> {
    const insertAll = this._db.transaction((transactionFeed: CurrentFeed) => {
      const feedResult: Result<CurrentFeed> = this.feedRepo.create(transactionFeed);
      const savedEntryIds: string[] = [];

      if (!feedResult.ok) {
        return feedResult;
      }

      for (const entry of feed.entries) {
        const entryResult: Result<string> = this.entryRepo.create(entry);

        if (!entryResult.ok) {
          console.error(`Error saving entry: ${entryResult.error}`);
          return entryResult;
        }

        savedEntryIds.push(entryResult.data);
      }

      const subscriptionResult = this.subscriptionRepo.create(new Subscription({ feedId: feedResult.data.id, userId }));
      if (!subscriptionResult.ok) {
        console.error(`Failed saving subscription: ${subscriptionResult.error}`);
        return subscriptionResult;
      }

      const unreadCollectionResult = this.collectionRepo.findUserCollectionByTitle(userId, 'Unread');
      if (!unreadCollectionResult.ok) {
        console.error(`Unread collection result error: ${unreadCollectionResult.error}`);
        return unreadCollectionResult;
      }

      for (const entryId of savedEntryIds) {
        const savedUnreadResult = this.collectionRepo.addEntry(entryId, feed.id, unreadCollectionResult.data.id!);
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

  unsubscribe(feedId: string, userId: number): Result<boolean> {
    // Okay, time to delete the subscription and
    // remove all entries with matching feedId
    const unsubTransaction = this._db.transaction((tsFeedId: string) => {
      const unsubResult = this.subscriptionRepo.delete(userId, feedId);
      const deleteEntriesResult = this.collectionRepo.removeEntriesByFeedId(userId, feedId);
    });

    try {
      unsubTransaction(feedId);
    } catch (err) {
      console.error(err);
      return { ok: false, error: String(err) };
    }

    return { ok: true, data: true };
  }
}