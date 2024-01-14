import Parser from 'rss-parser';
import type { Output } from 'rss-parser';
import type { Item } from 'rss-parser';
import { Result } from '../lib/interfaces/Result';
import { StringerFeed } from '../model/StringerFeed';
import { StringerItem } from '../model/StringerItem';
import type { StringerItemProps } from '../model/StringerItem';
import { RssItem } from '../lib/interfaces/RssItem';
import { extract, extractFromXml } from '@extractus/feed-extractor';
import { parse } from '@nooptoday/feed-rs';


// type RssItem = Item & {
//   author?: string;
//   creator?: string;
//   "content:encoded"?: string;
// };

export class RssService {
  parser: Parser;
  constructor (parser: Parser) {
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
      const itemProps: StringerItemProps = {
        id: undefined,
        title: parsedItem.title,
        author: parsedItem.author,
        link: parsedItem.link,
        pubDate: parsedItem.pubDate,
        content: parsedItem.content,
        contentEncoded: parsedItem["content:encoded"],
        contentSnippet: parsedItem.contentSnippet!.substring(0, 196) + '...',
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
}