import Parser from 'rss-parser';
import { Window } from 'happy-dom';
import jsdom from 'jsdom';
import * as htmlparser2 from 'htmlparser2';
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
const { JSDOM } = jsdom;

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
    const feedUrlResult = await resolveUrl(data.feedurl);
    if (!feedUrlResult.ok) {
      session.flash('error', feedUrlResult.error);
      return FeedResultPage(c);
    }
    const rssService = new RssService(new Parser());
    const feedResult = await rssService.getFeedByUrl(feedUrlResult.data);

    if (!feedResult.ok) {
      session.flash('error', 'Could not find a feed at that address.');
    } else {
      if (feedResult.data.feedUrl !== feedUrlResult.data) {
        feedResult.data.feedUrl = feedUrlResult.data;
      }

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
      return FeedResultPage(c);
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

async function resolveUrl(input: string): Promise<Result> {
  let updated: string;

  if (input.startsWith('http://') || input.startsWith('https://')) {
    updated = input;
  } else {
    updated = 'https://' + input;
  }

  // try to find a 'link rel="alternate || self || via" && type="rss+xml"
  const rssUrlResult = await findDocumentRssLink(updated);

  if (!rssUrlResult.ok) {
    return { ok: false, error: "Could not find RSS feed at that address." };
  }
  updated = rssUrlResult.data;

  return { ok: true, data: updated };
}

async function findDocumentRssLink(url: string): Promise<Result> {
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

  // const window = new Window({
  //   innerHeight: 768,
  //   innerWidth: 1024,
  //   url: url
  // });

  // const document = window.document;
  // document.write(data);
  // const dom = new JSDOM(data);
  // const document = dom.window.document;

  // const rssLink = document.querySelector('[type="application/rss+xml"]');
  let rssLink: string;

  const parser = new htmlparser2.Parser({
    onopentag(name, attribs, isImplied) {
      // For now, only return first
      // rss link.
      // TODO: Handle multiple RSS links
      if (!rssLink) {
        if (name === 'link' && attribs.rel === 'alternate' && attribs.type === 'application/rss+xml') {
          rssLink = attribs.href;
        }
        if (name === 'link' && attribs.rel === 'alternate' && attribs.type === 'application/atom+xml') {
          rssLink = attribs.href;
        }
      }
    }
  });

  parser.write(data);
  console.log({ rssLink });

  let finalUrl: string;

  if (rssLink != undefined) {
    // let rssHref = rssLink.getAttribute('href');
    if (!rssLink.startsWith(url)) {
      if (url.endsWith('/')) {
        finalUrl = url.substring(0, url.length - 1) + rssLink;
      } else {
        finalUrl = url + rssLink;
      }
    } else {
      finalUrl = rssLink;
    }
    return { ok: true, data: finalUrl };
  }

  return { ok: false, error: 'Could not find RSS url.' };
}

export default app;