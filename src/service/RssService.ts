import Parser from 'rss-parser';
import type { Output } from 'rss-parser';
import { Item } from 'rss-parser';
import { Result } from '../lib/interfaces/Result';
import { StringerFeed } from '../model/StringerFeed';
import { StringerItem } from '../model/StringerItem';
import type { StringerItemProps } from '../model/StringerItem';
import { RssItem } from '../lib/interfaces/RssItem';
import { extract, extractFromXml } from '@extractus/feed-extractor';
import { parse } from '@nooptoday/feed-rs';
import * as htmlparser2 from 'htmlparser2';

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

  async getRsFeed(url: string): Promise<Result> {
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

    let feed;
    try {
      const urlObj = new URL(url);
      const host = urlObj.host;
      const proto = urlObj.protocol;
      feed = parse(data, proto + host);
    } catch (err) {
      return { ok: false, error: String(err) };
    }

    return { ok: true, data: feed };
  }

  async getFeedByUrl(url: string): Promise<Result> {
    let response: Response;

    // leave this here in case you decide to
    // implement your own RSS normalization
    // const rsResult = await this.getRsFeed(url);
    // console.log(rsResult);

    try {
      response = await fetch(url);
    } catch (err) {
      return { ok: false, error: String(err) };
    }

    let xml: string;
    try {
      xml = await response.text();
    } catch (err) {
      return { ok: false, error: String(err) };
    }

    let parsed: Output<RssItem>;

    try {
      parsed = await this.parser.parseString(xml);
    } catch (err) {
      return { ok: false, error: String(err) };
    }

    const parsedImage = (parsed.image ? {
      url: parsed.image.url,
      link: parsed.image.link,
      title: parsed.image.title,
      width: parsed.image.width,
      height: parsed.image.height
    } : null);

    const feed = new StringerFeed(
      undefined,
      parsed.title,
      parsed.feedUrl,
      parsed.description,
      parsed.link,
      parsedImage,
      []);

    for (const parsedItem of parsed.items) {
      let summary;

      if (parsedItem.contentSnippet) {
        summary = parsedItem.contentSnippet.substring(0, 256);
      } else {
        summary = parsedItem.content.substring(0, 256);
      }
      const itemProps: StringerItemProps = {
        id: undefined,
        title: parsedItem.title,
        author: parsedItem.author,
        link: parsedItem.link,
        pubDate: parsedItem.pubDate,
        content: parsedItem.content,
        contentEncoded: parsedItem["content:encoded"],
        contentSnippet: summary,
        enclosure: parsedItem.enclosure,
        feedId: undefined,
        feedImage: feed.image,
        feedTitle: feed.title
      };

      const item: StringerItem = new StringerItem(itemProps);
      feed.addItem(item);
    }

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

  buildUrl(str: string): Result {
    let built: string = '';
    if (!str.startsWith('http://') && !str.startsWith('https://')) {
      built = `https://${str}`;
    }
    if (!this.isValidURL(built)) {
      return { ok: false, error: `Could not build a valid url from ${str}` };
    }
    return { ok: true, data: built };
  }

  async findDocumentRssLink(url: string): Promise<Result> {
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