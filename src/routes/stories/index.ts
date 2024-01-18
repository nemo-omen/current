import { Context, Hono } from 'hono';
import { Story } from './Story';
import { SQLiteFeedRepository } from '../../repo/FeedRepository';
import { db } from '../../lib/infra/sqlite';
import { StringerItem } from '../../model/StringerItem';

const app = new Hono();

app.get('/:id', async (c: Context) => {
  const session = c.get('session');
  const id = parseInt(c.req.param('id'));
  const itemRepo = new SQLiteFeedRepository(db);
  const itemResult = itemRepo.getItemById(id);
  if (!itemResult.ok) {
    session.flash('Could not find item');
  }
  const item = itemResult.data;
  if (item.enclosure) {
    item.enclosure = JSON.parse(item.enclosure);
  }

  c.set('item', itemResult.data);

  return Story(c);
});


export default app;