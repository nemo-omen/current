import { z } from 'zod';
import { Context, Hono } from 'hono';
import { validator } from 'hono/validator';
import { Dashboard } from './Dashboard';
import { AddFeedPage } from './AddFeedPage';
import { FeedResultPage } from './FeedResultPage';
import { SQLiteFeedRepository } from '../../repo/FeedRepository';
import { db } from '../../lib/infra/sqlite';
import { RssService } from '../../service/RssService';
import { Result } from '../../lib/interfaces/Result';

const app = new Hono();

const searchFormSchema = z.object({
  feedurl: z.string().url()
});

const subscribeFormSchema = z.object({
  subscriptionUrl: z.string().url()
});

app.get('/', async (c: Context) => {
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
    return Dashboard(c);
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
  return Dashboard(c);
});

app.get('/new', (c: Context) => {
  return AddFeedPage(c);
});

app.post(
  '/new',
  validator('form', (value, c) => {
    const result: z.SafeParseReturnType<any, any> = parseInput(c, searchFormSchema, value);
    return result.data;
  }),
  async (c: Context) => {
    const session = c.get('session');
    const rssService = new RssService();
    // Returns valid data only
    interface ValidatedSearch {
      data: {
        feedurl: string;
      };
    }
    let data: ValidatedSearch | null = c.req.valid('form');
    let feedurl: string;

    if (!data) {
      // If no valid data in form, get formData directly
      const formdata = (await c.req.formData());
      feedurl = String(formdata.get('feedurl'));
      // TODO: Call FeedRepository to SELECT title ILIKE
      //       or feedUrl ILIKE

      // we don't have a valid url, so attempt
      // to build one
      const builtUrlResult = rssService.buildUrl(feedurl);
      if (!builtUrlResult.ok) {
        // return results with flash error if can't build url
        session.flash('error', `Cannot find a feed for ${feedurl}. Try ${feedurl}.com?`);
        return FeedResultPage(c);
      }
      feedurl = builtUrlResult.data;
    } else {
      feedurl = data.feedurl;
    }

    // TODO: Call FeedRepository to SELECT feedUrl=feedurl

    const rssUrlResult = await rssService.findDocumentRssLink(feedurl);
    let rssUrl;
    if (!rssUrlResult.ok) {
      return { ok: false, error: "Could not find RSS feed at that address." };
    }

    rssUrl = rssUrlResult.data;

    const feedResult = await rssService.getFeedByUrl(rssUrl);

    if (!feedResult.ok) {
      session.flash('error', 'Could not find a feed at that address.');
    } else {
      if (feedResult.data.feedUrl !== rssUrl) {
        feedResult.data.feedUrl = rssUrl;
      }
      c.set('feed', feedResult.data);
    }
    // set context value to repopulate form
    // input on new page load
    c.set('searchUrl', feedurl);
    return FeedResultPage(c);
  }
);

app.post(
  '/subscribe',
  validator('form', (value, c) => {
    const result: z.SafeParseReturnType<any, any> = parseInput(c, subscribeFormSchema, value);
    return result.data;
  }),
  async (c: Context) => {
    let data: { subscriptionUrl: string; } = c.req.valid('form');
    const session = c.get('session');
    const feedService = new RssService();
    const feedRepo = new SQLiteFeedRepository(db);
    const rssFeedResult = await feedService.getFeedByUrl(data.subscriptionUrl);

    if (!rssFeedResult.ok) {
      session.flash('error', `These was an error subscribing to the feed at ${data.subscriptionUrl}`);
      return FeedResultPage(c);
    }

    try {
      await feedRepo.saveFeed(rssFeedResult.data);
    } catch (err) {
      session.flash('error', `There was an error subscribing to the feed at ${data.subscriptionUrl}`);
      return c.redirect('/dashboard/new');
    }

    return c.redirect('/dashboard');
  });

function parseInput(c: Context, schema: z.Schema, value: any): z.SafeParseReturnType<any, any> {
  const session = c.get('session');
  const result = schema.safeParse(value);

  if (!result.success) {
    const issues = result.error.issues;
    const issuePaths = issues.map((issue) => issue.path[0]);
    const issueMessages = issues.map((issue) => issue.message);
    for (let i = 0; i < issuePaths.length; i++) {
      session.flash(`${issuePaths[i]}Error`, issueMessages[i]);
    }
  }
  return result;
}

export default app;