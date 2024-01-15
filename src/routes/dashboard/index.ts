import { Dashboard } from './Dashboard';
import { AddFeedPage } from './AddFeedPage';
import { FeedResultPage } from './FeedResultPage';
import { Context, Hono } from 'hono';
import { SQLiteFeedRepository } from '../../repo/feed.repository';
import { db } from '../../lib/infra/sqlite';
import { z } from 'zod';
import { validator } from 'hono/validator';
import { RssService } from '../../service/RssService';
import Parser from 'rss-parser';
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
    // Returns valid data only
    let data: { feedurl: string; } = c.req.valid('form');
    if (!data) {
      // If no valid data, get formData directly
      const formdata = (await c.req.formData());
      data = { feedurl: String(formdata.get('feedurl')) };
    }
    const feedResult = await resolveUrl(data.feedurl);

    if (!feedResult.ok) {
      session.flash('error', 'Could not find a feed at that address.');
    } else {
      c.set('feed', feedResult.data);
    }
    // set context value to repopulate form
    // input on new page load
    c.set('searchUrl', data.feedurl);
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
    const feedService = new RssService(new Parser());
    const feedRepo = new SQLiteFeedRepository(db);
    const rssFeedResult = await feedService.getFeedByUrl(data.subscriptionUrl);

    if (!rssFeedResult.ok) {
      session.flash('error', `These was an error subscribing to the feed at ${data.subscriptionUrl}`);
      return c.redirect('/dashboard/new');
    }

    let persistResult;
    try {
      persistResult = await feedRepo.saveFeed(rssFeedResult.data);
    } catch (err) {
      session.flash('error', `There was an error subscribing to the feed at ${data.subscriptionUrl}`);
      return c.redirect('/dashboard/new');
    }

    return c.redirect('/dashboard');
  });

async function resolveUrl(input: string): Promise<unknown> {
  const rssService = new RssService(new Parser());
  let updated: string;

  if (input.startsWith('http://') || input.startsWith('https://')) {
    updated = input;
  } else {
    updated = 'https://' + input;
  }

  // try to find a 'link rel="alternate || self || via" && type="rss+xml"


  if (!updated.endsWith('rss') || !updated.endsWith('xml') || !updated.endsWith('feed')) {
    const rssResult = await rssService.getFeedByUrl(updated + '.rss');
    if (rssResult.ok) return rssResult;
    const xmlResult = await rssService.getFeedByUrl('.xml');
    if (xmlResult.ok) return xmlResult;
    const feedPathResult = await rssService.getFeedByUrl(updated + '/feed');
    if (feedPathResult.ok) return feedPathResult;
    const rssPathResult = await rssService.getFeedByUrl('/rss');
    if (rssPathResult.ok) return rssPathResult;
  }

  const result = await rssService.getFeedByUrl(updated);
  return result;
}

async function findDocumentRssLink(url: string): Result {
  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    return { ok: false, error: String(err) };
  }

  let data;
  try {
    data = await response.text();
  } catch (err) {
    return { ok: false, error: String(err) };
  }

}

export default app;