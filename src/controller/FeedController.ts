import { Context, Hono } from "hono";
import { validator } from 'hono/validator';
import { z } from "zod";
import { COMMON_FEED_EXTENSIONS } from "../lib/constants/COMMON_FEED_EXTENSIONS";
import { Result } from "../lib/types/Result";
import { db } from "../lib/infra/sqlite";
import { RssService } from "../service/RssService";
import { FeedRepository } from "../repo/FeedRepository";
import { ResultPage } from "../view/pages/feeds/Result";
import { Find } from "../view/pages/feeds/Find";
import { RssSource } from "../lib/types/RssSource";
import { CurrentFeed } from "../model/CurrentFeed";
import { SubscriptionService } from "../service/SubscriptionService";

const app = new Hono();

const searchFormSchema = z.object({
  feedurl: z.string().url()
});

const subscribeFormSchema = z.object({
  subscriptionUrl: z.string()
});

/**
 * Find feed page
 */
app.get('/find', (c: Context) => {
  return Find(c);
});

/**
 * Find a feed
 */
app.post(
  '/find',
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
      //       or feedUrl ILIKE (maybe search in categories too?)

      // we don't have a valid url, so attempt
      // to build one
      // TODO: (probably ought to remove this from RssService)
      const builtUrlResult = rssService.buildUrl(feedurl);
      if (!builtUrlResult.ok) {
        // return results with flash error if can't build url
        session.flash('error', `Cannot find a feed for ${feedurl}. Try ${feedurl}.com?`);
        return ResultPage(c);
      }
      feedurl = builtUrlResult.data;
    } else {
      feedurl = data.feedurl;
    }

    // TODO: Call FeedRepository to SELECT feedUrl=feedurl
    let rssUrl: string | undefined = undefined;

    for (const ext of COMMON_FEED_EXTENSIONS) {
      if (feedurl.endsWith(ext)) {
        rssUrl = feedurl;
      }
    }

    if (!rssUrl) {
      const rssUrlResult: Result<RssSource> = await rssService.findDocumentRssLink(feedurl);
      if (!rssUrlResult.ok) {
        session.flash('error', 'Could not find RSS feed at that address.');
        return ResultPage(c);
      }

      rssUrl = rssUrlResult.data.url;
    }

    if (rssUrl) {
      const feedResult: Result<CurrentFeed> = await rssService.getFeedByUrl(rssUrl);

      if (!feedResult.ok) {
        session.flash('error', 'Could not find a feed at that address.');
      } else {
        c.set('feed', feedResult.data);
      }
      // set context value to repopulate form
      // input on new page load
      c.set('searchUrl', rssUrl);
      return ResultPage(c);
    } else {
      session.flash('error', 'Could not find valid feed at that address.');
      c.set('searchUrl', feedurl);
      return ResultPage(c);
    }
  }
);

/**
 * Subscribe to a feed
 */
app.post(
  '/subscribe',
  validator('form', (value, c) => {
    const result: z.SafeParseReturnType<any, any> = parseInput(c, subscribeFormSchema, value);
    return result.data;
  }),
  async (c: Context) => {
    let data: { subscriptionUrl: string; } = c.req.valid('form');
    const session = c.get('session');
    const user = session.get('user');
    const feedService = new RssService();
    const feedRepo = new FeedRepository(db);
    const subscriptionService = new SubscriptionService(db);

    const rssFeedResult: Result<CurrentFeed> = await feedService.getFeedByUrl(data.subscriptionUrl);

    if (!rssFeedResult.ok) {
      c.set('searchUrl', data.subscriptionUrl);
      session.flash('error', `These was an error subscribing to the feed at ${data.subscriptionUrl}`);
      return ResultPage(c);
    }

    // 1.  Check if feed exists in db
    //     -- can search by id, since id
    //        is a field of feed-rs feeds
    //     -- probably better to stick to url
    //        since that's what we're using to
    //        get the full remote feed
    // 2a. Does not exist?
    //     - save feed to db
    // 2b. Exists? (should exist after 2a)
    //     - add record to `subscriptions` table
    // 3.  Show success message 
    //     (redirect to /app/feeds/find and show related?)
    //     (redirect to /app/posts/all?)

    let storedFeedResult: Result<CurrentFeed | null> = feedRepo.findByUrl(data.subscriptionUrl);

    if (!storedFeedResult.ok) {
      c.set('searchUrl', data.subscriptionUrl);
      c.set('feed', rssFeedResult.data);
      session.flash('error', `There was an error subscribing to the feed at ${data.subscriptionUrl}`);
      return ResultPage(c);
    }

    if (storedFeedResult.data === null) {
      const feed: CurrentFeed = rssFeedResult.data;

      try {
        subscriptionService.saveSubscriptionFeedEntries(feed, user.id);
      } catch (err) {
        // LOG
        console.log({ err });
        c.set('searchUrl', data.subscriptionUrl);
        c.set('feed', rssFeedResult.data);
        session.flash('error', `There was an error subscribing to the feed at ${data.subscriptionUrl}`);
        return ResultPage(c);
      }
      storedFeedResult = { ok: true, data: feed };
    }
    const feed: CurrentFeed = storedFeedResult.data!;

    session.flash('message', `You have successfully subscribed to ${feed.title}`);

    return c.redirect('/app');
  });

/**
 * Parses form input with zod schema
 * @param c Context
 * @param schema z.Schema
 * @param value Form input value
 * @returns z.SafeParseReturnType
 */
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