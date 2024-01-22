import { Context, Hono, Next } from "hono";
import PostController from './EntryController';
import FeedController from './FeedController';
import CollectionController from "./CollectionController";

const app = new Hono();

app.use('*', async (c: Context, next: Next) => {
  const session = c.get('session');
  const sessionUser = session.get('user');

  if (!sessionUser) {
    return c.redirect('/auth/login');
  }
  await next();
});

app.get('/', async (c: Context) => {
  return c.redirect('/app/posts/all');
});

app.route('/posts', PostController);
app.route('/feeds', FeedController);
app.route('/collections', CollectionController);

export default app;