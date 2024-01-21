import type { Enclosure } from "rss-parser";
import type { FeedImage } from "../lib/types/FeedImage";

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
  feedImage?: FeedImage,
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
  feedImage?: FeedImage;

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

  static fromPersistence(i: StringerItemPersistDTO) {
    const enclosure = i.enclosure ? JSON.parse(i.enclosure) : null;
    const props = { ...i, enclosure };
    return new StringerItem(props);
  }

  toPersistence(): StringerItemPersistDTO {
    const serializedEnc = this.enclosure ? JSON.stringify(this.enclosure) : null;
    const { feedImage, feedTitle, ...result } = this;
    return { ...result, enclosure: serializedEnc };
  }
}

type StringerItemPersistDTO = {
  id?: number,
  title?: string,
  author?: string,
  link?: string,
  pubDate?: string,
  content?: string,
  contentEncoded?: string,
  contentSnippet?: string,
  enclosure?: string,
  feedId?: number,
};

type StringerItemPresentDTO = {
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
  feedImage?: FeedImage,
};