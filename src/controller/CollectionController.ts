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
    session.flash('error', 'There was a problem getting unread posts.');
    return PostList(c);
  }

  if (!unreadCollectionResult.data) {
    session.flash('error', 'There was a problem getting unread posts.');
    return PostList(c);
  }

  const collectionEntryIdsResult = collectionRepo
    .getCollectionEntryIdsByCollectionId(unreadCollectionResult.data.id!);
  // console.log({ collectionEntryIdsResult });

  if (!collectionEntryIdsResult.ok) {
    session.flash('error', 'There was a problem getting unread posts.');
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
  c.set('posts', unreadEntries.sort(
    (a, b) => (
      new Date(b.published).valueOf() - (new Date(a.published).valueOf()))
  )
  );

  return PostList(c);
});

app.get('/read-later', (c: Context) => {
  const session = c.get('session');
  const user = session.get('user');
  const collectionRepo = new CollectionRepository(db);
  const entryRepo = new EntryRepository(db);
  const readLaterEntries: CurrentEntry[] = [];

  const collectionResult: Result<Collection> = collectionRepo.findUserCollectionByTitle(user.id, 'Read Later');

  if (!collectionResult.ok) {
    session.flash('error', 'Could not retrieve Read Later collection');
    return CollectionList(c);
  }

  if (!collectionResult.data) {
    session.flash('error', 'Could not retrieve Read Later collection');
    return CollectionList(c);
  }

  const collectionEntryIdsResult = collectionRepo.getCollectionEntryIdsByCollectionId(collectionResult.data.id!);

  if (!collectionEntryIdsResult.ok) {
    session.flash('error', 'There was a problem getting Read Later entries');
    return CollectionList(c);
  }

  if (!collectionEntryIdsResult.data) {
    session.flash('error', 'There was a problem getting Read Later entries');
    return CollectionList(c);
  }

  for (const entryId of collectionEntryIdsResult.data) {
    const entryResult = entryRepo.findById(entryId);

    if (!entryResult.ok) {
      session.flash('error', 'Could not retrieve entry');
      // should probably not return for a single missing entry
      // but ... I do need to recover here, can't just
      // send back an incomplete list of items.
    }

    if (entryResult.data) {
      readLaterEntries.push(entryResult.data);
    }
  }

  c.set('pageTitle', 'Read Later');
  c.set('collectionTitle', 'Read Later');
  c.set('entries', readLaterEntries);
  return CollectionList(c);
});

// app.get('/saved', (c: Context) => {
//   c.set('pageTitle', 'Saved Posts');
//   c.set('collectionTitle', 'Saved Posts');
//   return CollectionList(c);
// });

app.get('/new', (c: Context) => {
  c.set('pageTitle', 'Add Collection');
  return NewCollection(c);
});

app.get('/user/:slug', (c: Context) => {
  c.set('pageTitle', 'Your personal collection');
  c.set('collectionTitle', 'Your personal collection');
  return CollectionList(c);
});

app.post('/add-entry', (c: Context) => {
  // validation -- need entryId, collectionName
  console.log(c.req.formData());
  // probably need to redirect to collection
  // page => /user/:slug
  c.set('pageTitle', 'Your personal collection');
  c.set('collectionTitle', 'Your personal collection');
  return CollectionList(c);
});

app.post('/remove-entry', (c: Context) => {
  // validation -- need entryId, collectionName
  console.log(c.req.formData());
  // probably need to redirect to collection
  // page => /user/:slug
  c.set('pageTitle', 'Your personal collection');
  c.set('collectionTitle', 'Your personal collection');
  return CollectionList(c);
});

export default app;