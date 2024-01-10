import type { Enclosure } from "rss-parser";

export class FeedItem {
  title?: string;
  author?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentEncoded?: string;
  contentSnippet?: string;
  enclosure?: Enclosure;

  constructor (
    title?: string,
    author?: string,
    link?: string,
    pubDate?: string,
    content?: string,
    contentEncoded?: string,
    contentSnippet?: string,
    enclosure?: Enclosure,
  ) {
    this.title = title;
    this.author = author;
    this.link = link;
    this.pubDate = pubDate;
    this.content = content;
    this.contentEncoded = contentEncoded;
    this.contentSnippet = contentSnippet;
    this.enclosure = enclosure;
  }
}