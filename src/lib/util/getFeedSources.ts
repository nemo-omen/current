import { Result } from "../types/Result";
import { RssSource } from "../types/RssSource";
import { FEEDTYPES } from "../constants/FEEDTYPES";
import { COMMON_FEED_EXTENSIONS } from "../constants/COMMON_FEED_EXTENSIONS";
import { parse } from 'node-html-parser';

/**
 * Attempts to find a valid RSS URL at the given site URL
 * by first attempting to find links in the <head> tag. If
 * none are found, it tries guessing a valid RSS link. Each guess
 * is used to try sending a `HEAD` request which is then checked
 * for common RSS`content-type` headers.
 * @param url A valid URL to attempt finding RSS feed URLs at
 * @returns Result<RssSource[]> - An array of RssSources
 */
export async function getFeedSources(url: string): Promise<Result<RssSource[]>> {
  let rssSources: RssSource[] = [];
  const htmlBodyResult = await getHtmlBody(url);

  if (!htmlBodyResult.ok) {
    return htmlBodyResult;
  }

  const allRssSources: RssSource[] = findLinksInHtmlBody(htmlBodyResult.data);

  for (const rssSource of allRssSources) {
    const absoluteRssSource: RssSource | null = makeAbsolute(rssSource, url);
    if (absoluteRssSource) {
      rssSources.push(absoluteRssSource);
    }
  }

  if (rssSources.length > 0) {
    return { ok: true, data: rssSources };
  }

  // try guessing
  const rssGuessSource: RssSource | null = await guessRssLink(url);

  if (rssGuessSource) {
    rssSources.push(rssGuessSource);
  }

  if (rssSources.length > 0) {
    return { ok: true, data: rssSources };
  }

  return { ok: false, error: 'Could not find any feed links' };
}

export function generateGuessUrls(url: string): string[] {
  const guesses: string[] = [];
  let urlObject: URL | null = new URL(url);
  const baseUrl = urlObject.href;


  for (const ext of COMMON_FEED_EXTENSIONS) {
    let guessed: string | undefined = undefined;
    if (url != baseUrl) {
      guesses.push(url + ext);
    }

    try {
      const pathname = urlObject.pathname.endsWith('/')
        ? urlObject.pathname.substring(0, urlObject.pathname.length - 1)
        : urlObject.pathname;
      const guessedUrl = new URL(pathname + ext, urlObject.origin);
      guessed = guessedUrl.href;
    } catch (err) {
      // ignore
    }
    if (guessed) {
      guesses.push(guessed);
    }
  }
  urlObject = null;
  return guesses;
}

export async function guessRssLink(url: string): Promise<RssSource | null> {
  const guessLinks = generateGuessUrls(url);

  for (const link of guessLinks) {
    let response: Response | undefined = undefined;

    try {
      response = await fetch(link, { method: 'HEAD' });
    } catch (err) {
      return null;
    }

    if (response.status === 200) {
      const type = response.headers.get('content-type')?.split(';')[0];
      if (type) {
        if (FEEDTYPES.includes(type)) {
          return {
            type,
            url: link
          };
        }
      }
    }
  }
  return null;
}

export function makeAbsolute(rssSource: RssSource, rootUrl: string): RssSource | null {
  let url: URL | undefined = undefined;
  let srcCopy: RssSource;

  try {
    url = new URL(rssSource.url);
  } catch (err) {
    url = undefined;
  }

  if (!url) {
    try {
      url = new URL(rssSource.url, rootUrl);
    } catch (err) {
      url = undefined;
    }
  }

  if (url) {
    srcCopy = {
      type: rssSource.type,
      url: url.href
    };

    return srcCopy;
  }

  return null;
}

export function findLinksInHtmlBody(htmlBody: string): RssSource[] {
  const document = parse(htmlBody);

  const rssLinks: RssSource[] = [];
  const allDocumentLinks = document.querySelectorAll('link');


  for (const link of allDocumentLinks) {
    const type = link.getAttribute('type');
    const href = link.getAttribute('href');
    if (FEEDTYPES.includes(type)) {
      rssLinks.push({
        type: type,
        url: href
      });
    }
  }
  return rssLinks;
}

export async function getHtmlBody(url: string): Promise<Result<string>> {
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

  return { ok: true, data };
};