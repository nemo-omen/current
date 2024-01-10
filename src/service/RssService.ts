import Parser from 'rss-parser';
import { Feed } from '../model/Feed';
import type { Output } from 'rss-parser';
import type { Item } from 'rss-parser';
import { FeedItem } from '../model/FeedItem';

type Result = { data: any; ok: true; } | { error: string; ok: false; };

export class RssService {
  parser: Parser;
  constructor (parser: Parser) {
    this.parser = new Parser();
  }

  async getFeedByUrl(url: string): Promise<Result> {
    let response: Response;

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

    let parsed: Output<Item>;
    try {
      parsed = await this.parser.parseString(xml);
    } catch (err) {
      return { ok: false, error: String(err) };
    }

    const feed = new Feed({
      title: parsed.title,
      feedUrl: parsed.feedUrl,
      description: parsed.description,
      link: parsed.link,
      items: []
    });

    for (const parsedItem of parsed.items) {
      const item: FeedItem = new FeedItem({
        title: parsedItem.title,
        link: parsedItem.link,
        pubDate: parsedItem.pubDate,
        content: parsedItem.content,
        contentSnippet: parsedItem.contentSnippet!.substring(0, 196) + '...',
      });
      feed.addItem(item);
    }
    return { ok: true, data: feed };
  }
}