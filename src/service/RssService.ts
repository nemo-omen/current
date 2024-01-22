import Parser from 'rss-parser';
import { Result } from '../lib/types/Result';
import { parse, Feed, Entry } from '@nooptoday/feed-rs';
import type { RssSource } from '../lib/types/RssSource';
import { getFeedSources } from '../lib/util/getFeedSources';
import { parse as parseHtml } from 'node-html-parser';

export class RssService {
  parser: Parser;

  constructor () {
    this.parser = new Parser();
  }

  async getFeedByUrl(url: string): Promise<Result<Feed>> {
    let response: Response;
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

    let feed: Feed;

    try {
      const urlObj = new URL(url);
      feed = parse(data, urlObj.origin);
    } catch (err) {
      return { ok: false, error: String(err) };
    }

    for (const entry of feed.entries) {
      if (entry.content?.contentType === 'text/html') {
        const root = parseHtml(entry.content.body!);

        const p = root.querySelector('p');

        if (p) {
          if (p.innerHTML) {
            entry.summary = {
              contentType: 'text/html',
              content: `<p>${p.innerHTML}</p>`
            };
          }
        }
      }
    }

    const { categories, ...rest } = feed;
    console.log({ categories });

    // We can just send back the Feed directly
    // from feed-rs. I don't think I need to
    // worry about transforming that into
    // a StringerFeed until the user has subscribed.
    return { ok: true, data: feed };
  }

  isValidURL(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch (err) {
      return false;
    }
  }

  buildUrl(str: string): Result<string> {
    let built: string = '';
    if (!str.startsWith('http://') && !str.startsWith('https://')) {
      built = `https://${str}`;
    }
    if (!this.isValidURL(built)) {
      return { ok: false, error: `Could not build a valid url from ${str}` };
    }
    return { ok: true, data: built };
  }

  async findDocumentRssLink(url: string): Promise<Result<RssSource>> {
    let rssUrlResult: Result<RssSource[]>;
    try {
      rssUrlResult = await getFeedSources(url);
      // rssUrlResult = await getRssUrlsFromUrl(url);
    } catch (err) {
      return { ok: false, error: String(err) };
    }
    if (rssUrlResult.ok) {
      if (rssUrlResult.data.length < 1) {
        return { ok: false, error: 'No RSS url at that location.' };
      } else {
        // TODO: Handle multiple feeds at same url
        return { ok: true, data: rssUrlResult.data[0] };
      }
    }
    return { ok: false, error: 'No RSS url at that location' };
  }
}