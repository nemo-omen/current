import Parser from 'rss-parser';
import type { Output } from 'rss-parser';
import { Result } from '../lib/interfaces/Result';
import { StringerFeed } from '../model/StringerFeed';
import { StringerItem } from '../model/StringerItem';
import type { StringerItemProps } from '../model/StringerItem';
import { RssItem } from '../lib/interfaces/RssItem';
import * as htmlparser2 from 'htmlparser2';
import * as CssSelect from 'css-select';
import { parse, Feed, Entry } from '@nooptoday/feed-rs';
import { JSDOM } from 'jsdom';
import { getRssUrlsFromUrl } from 'rss-url-finder';
import type { RssSource } from 'rss-url-finder';
// type RssItem = Item & {
//   author?: string;
//   creator?: string;
//   "content:encoded"?: string;
// };

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
      const host = urlObj.host;
      const proto = urlObj.protocol;
      feed = parse(data, proto + host);
    } catch (err) {
      return { ok: false, error: String(err) };
    }

    for (const entry of feed.entries) {
      if (entry.content?.contentType === 'text/html') {
        const { document } = new JSDOM(entry.content.body).window;
        const p = document.querySelector('p');
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

  async findDocumentRssLink(url: string): Promise<Result<string>> {
    let rssUrlResult: RssSource[];
    try {
      rssUrlResult = await getRssUrlsFromUrl(url);
    } catch (err) {
      return { ok: false, error: String(err) };
    }
    // TODO: Handle multiple feeds at same url
    return { ok: true, data: rssUrlResult[0] };
  }
}