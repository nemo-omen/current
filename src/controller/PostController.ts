import { Context, Hono } from "hono";
import { All } from "../view/pages/posts/All";
import { Result } from "../lib/interfaces/Result";
import { SQLiteFeedRepository } from "../repo/FeedRepository";
import { RssService } from "../service/RssService";
import { db } from "../lib/infra/sqlite";
import { Post } from "../view/pages/posts/Post";

const app = new Hono();

app.get('/all', async (c: Context) => {
  const feedRepo = new SQLiteFeedRepository(db);
  const rssService = new RssService();
  const session = c.get('session');
  // TODO: Paginate results if not HTMX request
  // TODO: Page should be a URL param
  let page = session.get('page');
  // TODO: Limit should also be a URL param
  let limit = session.get('limit');

  if (!page) {
    page = 1;
  }

  //TODO: When we integrate HTMX, the pattern should be:
  // 1. Get stored feeds from DB
  // 2. Render them
  // 3. Fetch updated feeds
  // 4. Store new items
  // 5. Render new items
  // 6. Set an update interval and run steps 3-5

  const feedInfoResult: Result = feedRepo.getFeedInfo();

  if (!feedInfoResult.ok) {
    session.flash('error', 'Could not get feeds from database.');
    return All(c);
  }

  for (const feedInfo of feedInfoResult.data) {
    const { id, title, feedUrl } = feedInfo;
    const rssFeedResult = await rssService.getFeedByUrl(feedUrl);
    if (!rssFeedResult.ok) {
      // ignore error?
      // session.flash('error', `There was an error fetching feed updates from ${title}.`);
    } else {
      const rssFeed = rssFeedResult.data;
      for (const rssItem of rssFeed.items) {
        const itemInsertResult = feedRepo.insertItem(rssItem, id);
        if (!itemInsertResult.ok) {
          console.log(`Failed to insert item: ${rssItem.title}`);
        }
      }
    }
  }

  const storedItemsResult: Result = feedRepo.getAllItems(page);

  if (!storedItemsResult.ok) {
    session.flash('error', 'Feeds could not be loaded.');
  }

  const itemCountResult: Result = feedRepo.getTotalItemCount();

  if (!itemCountResult.ok) {
    // TODO: flash doesn't feel right here
    session.flash('error', 'Could not get count of items.');
  }

  c.set('dashboardItems', storedItemsResult.data);
  c.set('itemCount', itemCountResult.data);
  session.set('page', page);
  return All(c);
});

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

  return Post(c);
});


export default app;