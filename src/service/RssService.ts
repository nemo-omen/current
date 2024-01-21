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
    let finalUrl: string;

    if (rssLink != undefined) {
      // TODO: You need something better here.
      if (rssLink.startsWith('https')) {
        return { ok: true, data: rssLink };
      }

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
}