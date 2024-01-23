import { Context, Hono } from "hono";
import { PostList } from "../view/pages/posts/PostList";
import { Result } from "../lib/types/Result";
import { FeedInfo, SQLiteFeedRepository } from "../repo/FeedRepository";
import { SubscriptionRepository } from "../repo/SubscriptionRepository";
import { RssService } from "../service/RssService";
import { db } from "../lib/infra/sqlite";
import { Post } from "../view/pages/posts/Post";
import { StringerEntry } from "../model/StringerEntry";
import { Subscription } from "../lib/types/Subscription";
import { None } from "../view/pages/posts/None";
import { Find } from "../view/pages/feeds/Find";
import { StringerFeed } from "../model/StringerFeed";

const app = new Hono();

app.get('/all', async (c: Context) => {
  const feedRepo = new SQLiteFeedRepository(db);
  const subscriptionRepo = new SubscriptionRepository(db);
  const rssService = new RssService();
  const session = c.get('session');
  const user = session.get('user');
  const posts: StringerEntry[] = [];

  //TODO: When we integrate HTMX, the pattern should be:
  // 1. Get stored feeds from DB
  // 2. Render them
  // 3. Fetch updated feeds
  // 4. Store new items
  // 5. Render new items
  // 6. Set an update interval and run steps 3-5
  const subscriptionsResult: Result<Subscription[]> = subscriptionRepo.getUserSubscriptions(user.id);

  if (!subscriptionsResult.ok) {
    session.flash('error', 'There was a problem getting your subscriptions.');
    return PostList(c);
  }

  const subscriptions: Subscription[] = subscriptionsResult.data;
  c.set('subscriptions', subscriptions);

  if (subscriptions.length < 1) {
    c.set('pageTitle', 'Find Feeds');
    return c.redirect('/app/feeds/find');
  }

  for (const subscription of subscriptions) {
    const feedResult: Result<StringerFeed | null> = feedRepo.getFeedById(subscription.feedId);

    if (!feedResult.ok) {
      session.flash('error', 'There was a problem getting your feeds.');
      return c.redirect('/app/feeds/find');
      // return PostList(c);
    }

    if (feedResult.data === null) {
      session.flash('error', 'There was a problem getting your feeds.');
      return c.redirect('/app/feeds/find');
      // return PostList(c);
    }

    const feed = feedResult.data;
    const entriesResult: Result<StringerEntry[]> = feedRepo.getEntriesByFeedId(feed.id);

    if (!entriesResult.ok) {
      session.flash('error', 'There was a problem getting your feeds.');
      return c.redirect('/app/feeds/find');
      // return PostList(c);
    }

    posts.push(...entriesResult.data);
  }


  c.set('posts', posts);
  c.set('pageTitle', 'All Posts');
  return PostList(c);
});

app.get('/:id', async (c: Context) => {
  const session = c.get('session');
  const id = parseInt(c.req.param('id'));
  const itemRepo = new SQLiteFeedRepository(db);
  const itemResult: Result<StringerEntry> = itemRepo.getEntryById(id);
  if (!itemResult.ok) {
    session.flash('Could not find item');
  } else {
    const item = itemResult.data;
    c.set('item', item);
  }

  return Post(c);
});


export default app;