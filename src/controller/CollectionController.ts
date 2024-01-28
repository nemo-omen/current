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
import { CollectionRepository } from "../repo/CollectionRepository";
import { Collection } from "../model/Collection";
import { EntryRepository } from "../repo/EntryRepository";


const app = new Hono();

app.get('/', (c: Context) => {
  // return collections edit page
  c.set('pageTitle', 'Your Collections');
  return Edit(c);
});

app.get('/unread', (c: Context) => {
  const session = c.get('session');
  const user = session.get('user');
  const collectionRepo = new CollectionRepository(db);
  const entryRepo = new EntryRepository(db);

  const unreadCollectionResult: Result<Collection> = collectionRepo.findUserCollectionByTitle(user.id, 'Unread');

  if (!unreadCollectionResult.ok) {
    session.flash('There was a problem getting unread posts.');
    return PostList(c);
  }

  if (!unreadCollectionResult.data) {
    session.flash('There was a problem getting unread posts.');
    return PostList(c);
  }

  const collectionEntryIdsResult = collectionRepo
    .getCollectionEntryIdsByCollectionId(unreadCollectionResult.data.id!);
  // console.log({ collectionEntryIdsResult });

  if (!collectionEntryIdsResult.ok) {
    session.flash('There was a problem getting unread posts.');
    return PostList(c);
  }

  const unreadEntries: CurrentEntry[] = [];

  for (const entryId of collectionEntryIdsResult.data) {
    const entryResult: Result<CurrentEntry> = entryRepo.findById(entryId);

    if (!entryResult.ok) {
      //TODO: Better figure out some proper logging!
      console.error(`Unable to retrieve entry with id ${entryId}`);
    } else {
      unreadEntries.push(entryResult.data);
    }
  }

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