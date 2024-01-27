import { Context } from "hono";
import { Hono } from "hono";
import { Edit } from "../view/pages/collections/Edit";
import { CollectionList } from "../view/pages/collections/CollectionList";
import { NewCollection } from "../view/pages/collections/NewCollection";
import { PostList } from "../view/pages/posts/PostList";
import { CurrentEntry } from "../model/CurrentEntry";
import { SubscriptionService } from "../service/SubscriptionService";
import { Result } from "../lib/types/Result";
import { db } from "../lib/infra/sqlite";


const app = new Hono();

app.get('/', (c: Context) => {
  // return collections edit page
  c.set('pageTitle', 'Your Collections');
  return Edit(c);
});

app.get('/unread', (c: Context) => {
  const session = c.get('session');
  const user = session.get('user');
  const subscriptionService = new SubscriptionService(db);
  const unreadEntriesResult: Result<CurrentEntry[]> = subscriptionService.getUnreadSubscriptionEntries(user.id);

  if (!unreadEntriesResult.ok) {
    session.flash('error', 'There was an error getting your unread posts.');
    return PostList(c);
  }

  const unreadEntries = unreadEntriesResult.data;

  c.set('pageTitle', 'Unread Posts');
  c.set('posts', unreadEntries);

  return PostList(c);
});

app.get('/read-later', (c: Context) => {
  c.set('pageTitle', 'Reading List');
  c.set('collectionTitle', 'Reading List');
  return CollectionList(c);
});

app.get('/saved', (c: Context) => {
  c.set('pageTitle', 'Saved Posts');
  c.set('collectionTitle', 'Saved Posts');
  return CollectionList(c);
});

app.get('/new', (c: Context) => {
  c.set('pageTitle', 'Add Collection');
  return NewCollection(c);
});

export default app;