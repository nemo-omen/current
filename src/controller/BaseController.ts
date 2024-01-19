import { Context, Hono } from 'hono';
import { Page } from '../view/pages/front/Page';

const app = new Hono();

app.get('/', (c: Context) => {
  const session = c.get('session');
  const sessionUser = session.get('user');
  if (sessionUser) {
    return c.redirect('/app');
  }
  return Page(c);
});

export default app;