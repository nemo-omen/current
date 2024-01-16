import { z } from 'zod';
import { Context, Hono } from 'hono';
import { validator } from 'hono/validator';
import { Dashboard } from './Dashboard';
import { AddFeedPage } from './AddFeedPage';
import { FeedResultPage } from './FeedResultPage';
import { SQLiteFeedRepository } from '../../repo/feed.repository';
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
  const session = c.get('session');
  // TODO: Page should be a URL param
  let page = session.get('page');
  // TODO: Limit should also be a URL param
  let limit = session.get('limit');

  if (!page) {
    page = 1;
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
    const session = c.get('session');
    const result = searchFormSchema.safeParse(value);
    if (!result.success) {
      const issues = result.error.issues;
      const issuePaths = issues.map((issue) => issue.path[0]);
      const issueMessages = issues.map((issue) => issue.message);
      for (let i = 0; i < issuePaths.length; i++) {
        session.flash(`${issuePaths[i]}Error`, issueMessages[i]);
      }
    }
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

    // TODO: Search db for stored feeds before hitting the service
    //       and making an expensive network call.

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
    const session = c.get('session');
    const result = subscribeFormSchema.safeParse(value);
    if (!result.success) {
      const issues = result.error.issues;
      const issuePaths = issues.map((issue) => issue.path[0]);
      const issueMessages = issues.map((issue) => issue.message);
      for (let i = 0; i < issuePaths.length; i++) {
        session.flash(`${issuePaths[i]}Error`, issueMessages[i]);
      }
    }
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

export default app;