import { Context, Hono, Next } from "hono";
import PostController from './EntryController';
import FeedController from './FeedController';
import CollectionController from "./CollectionController";
import NoteController from "./NoteController";
import { SubscriptionRepository } from "../repo/SubscriptionRepository";
import { db } from "../lib/infra/sqlite";
import { Result } from "../lib/types/Result";
import { Subscription } from "../model/Subscription";
import { CurrentFeed } from "../model/CurrentFeed";
import { FeedRepository } from "../repo/FeedRepository";

const app = new Hono();

app.use('*', async (c: Context, next: Next) => {
  const session = c.get('session');
  const sessionUser = session.get('user');

  if (!sessionUser) {
    return c.redirect('/auth/login');
  } else {
    const subscriptionRepo = new SubscriptionRepository(db);
    const feedRepo = new FeedRepository(db);
    const subscriptionResponse: Result<Subscription[]> = subscriptionRepo.getSubscriptionByUserId(sessionUser.id);
    const userFeeds: CurrentFeed[] = [];

    if (!subscriptionResponse.ok) {
      // do nothing -- userFeeds is empty
    } else {
      for (const subscription of subscriptionResponse.data) {
        const feedResponse: Result<CurrentFeed | null> = feedRepo.findById(subscription.feedId);

        if (feedResponse.ok && feedResponse.data !== null) {
          userFeeds.push(feedResponse.data);
        }
      }
    }
    c.set('userFeeds', userFeeds);

  }
  await next();
});

app.get('/', async (c: Context) => {
  return c.redirect('/app/posts/all');
});

app.route('/posts', PostController);
app.route('/feeds', FeedController);
app.route('/collections', CollectionController);
app.route('/notes', NoteController);

export default app;