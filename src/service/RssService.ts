import { Result } from '../lib/types/Result';
import { parse, Feed } from '@nooptoday/feed-rs';
import type { RssSource } from '../lib/types/RssSource';
import { getFeedSources } from '../lib/util/getFeedSources';
import { CurrentFeed } from '../model/CurrentFeed';

export class RssService {

  async getFeedByUrl(url: string): Promise<Result<CurrentFeed>> {
    let response: Response;
    const urlObj = new URL(url);

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

    let remoteFeed: Feed | undefined = undefined;
    let stringerFeed: CurrentFeed | undefined = undefined;

    try {
      const urlObj = new URL(url);
      remoteFeed = parse(data, urlObj.origin);
    } catch (err) {
      return { ok: false, error: String(err) };
    }

    if (remoteFeed) {
      stringerFeed = CurrentFeed.fromRemote(remoteFeed, urlObj.origin, urlObj.href);
    }

    if (!stringerFeed) {
      return { ok: false, error: 'Could not parse feed' };
    }

    return { ok: true, data: stringerFeed };
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