import type { Enclosure } from "rss-parser";

export type StringerItemProps = {
  id?: number,
  title?: string,
  author?: string,
  link?: string,
  pubDate?: string,
  content?: string,
  contentEncoded?: string,
  contentSnippet?: string,
  enclosure?: Enclosure,
  feedId?: number,
  feedTitle?: string,
  feedImage?: { url?: string, title?: string, width?: number, height?: number; },
};

export class StringerItem {
  id?: number;
  title?: string;
  author?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentEncoded?: string;
  contentSnippet?: string;
  enclosure?: Enclosure;
  feedId?: number;
  feedTitle?: string;
  feedImage?: { url?: string, title?: string, width?: number, height?: number; };

  constructor (props: StringerItemProps) {
    this.id = props.id;
    this.title = props.title;
    this.author = props.author;
    this.link = props.link;
    this.pubDate = props.pubDate;
    this.content = props.content;
    this.contentEncoded = props.contentEncoded;
    this.contentSnippet = props.contentSnippet;
    this.enclosure = props.enclosure;
    this.feedId = props.feedId;
    this.feedTitle = props.feedTitle;
    this.feedImage = props.feedImage;
  }
}