import { Context } from "hono";
import { Hono } from "hono";
import { Edit } from "../view/pages/collections/Edit";
import { CollectionList } from "../view/pages/collections/CollectionList";

const app = new Hono();

app.get('/', (c: Context) => {
  // return collections edit page
  c.set('pageTitle', 'Your Collections');
  return Edit(c);
});

app.get('/unread', (c: Context) => {
  c.set('pageTitle', 'Unread Posts');
  c.set('collectionTitle', 'Unread Posts');
  return CollectionList(c);
});

app.get('/reading-list', (c: Context) => {
  c.set('pageTitle', 'Reading List');
  c.set('collectionTitle', 'Reading List');
  return CollectionList(c);
});

app.get('/saved', (c: Context) => {
  c.set('pageTitle', 'Saved Posts');
  c.set('collectionTitle', 'Saved Posts');
  return CollectionList(c);
});

export default app;