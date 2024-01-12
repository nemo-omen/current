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

const app = new Hono();

const searchFormSchema = z.object({
  feedurl: z.string().url()
});

app.get('/', async (c: Context) => {
  const feedRepo = new SQLiteFeedRepository(db);
  const storedFeeds = feedRepo.getFeeds();
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
    // Returns valid data only
    let data: { feedurl: string; } = c.req.valid('form');
    if (!data) {
      // If no valid data, get formData directly
      const formdata = (await c.req.formData());
      data = { feedurl: String(formdata.get('feedurl')) };
    }
    const feedResult = await resolveUrl(data.feedurl);

    if (feedResult.ok) {
      c.set('feed', feedResult.data);
    }
    // set context value to repopulate form
    // input on new page load
    c.set('searchUrl', data.feedurl);
    return FeedResultPage(c);
  }
);

app.post('/subscribe', (c: Context) => {
  const feedRepo = new SQLiteFeedRepository(db);

});

async function resolveUrl(input: string): Promise<unknown> {
  const rssService = new RssService(new Parser());
  let updated: string;
  if (input.startsWith('http://') || input.startsWith('https://')) {
    updated = input;
  } else {
    updated = 'https://' + input;
  }

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

export default app;