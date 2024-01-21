import { expect, test } from 'bun:test';
import { findLinksInHtmlBody, generateGuessUrls, getFeedSources, getHtmlBody, guessRssLink, makeAbsolute } from './getFeedSources';
import { Result } from '../types/Result';
import { RssSource } from '../types/RssSource';

test("findLinksInHtmlBody", async () => {
  const rootUrl = 'https://developer.mozilla.org/en-US/blog/';
  const htmlBodyResult: Result<string> = await getHtmlBody(rootUrl);
  const allLinksResult: RssSource[] = findLinksInHtmlBody(htmlBodyResult.data);
  expect(allLinksResult).toBeArray();
  expect(allLinksResult.length).toBeGreaterThan(0);
});

test("guessLinks", () => {
  const rootUrls = [
    'https://reddit.com/r/webdev',
    'https://lorem-rss.herokuapp.com/',
    'https://nytimes.com'
  ];

  for (const rootUrl of rootUrls) {
    const guessLinks = generateGuessUrls(rootUrl);
    expect(guessLinks.length).toBeGreaterThan(0);
  }
});

test("getFeedSources", async () => {
  const rootUrls = [
    'https://reddit.com/r/webdev',
    'https://lorem-rss.herokuapp.com/',
  ];

  for (const rootUrl of rootUrls) {
    const rssSources = await getFeedSources(rootUrl);
    console.log(rssSources);
    expect(rssSources.ok).toBeTrue();
    expect(rssSources.error).toBeNil();
    expect(rssSources.data).toBeArray();
  }
});