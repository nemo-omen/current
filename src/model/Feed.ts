import { number } from "zod";
import { FeedItem } from "./FeedItem";

export class Feed {
  feedUrl?: string;
  title?: string;
  description?: string;
  link?: string;
  image?: {
    url: string,
    link?: string,
    title?: string,
    width?: number,
    height?: number,
  };
  items?: FeedItem[];

  constructor (
    title?: string,
    feedUrl?: string,
    description?: string,
    link?: string,
    image?: {
      url: string,
      link?: string,
      title?: string,
      width?: string,
      height?: string,
    },
    items?: FeedItem[],
  ) {
    this.feedUrl = feedUrl;
    this.title = title;
    this.description = description;
    this.link = link;
    this.items = items || [];
    if (image) {

      this.image = {
        url: image.url,
        link: image.link,
        title: image.title || '',
        width: parseInt(image.width) || null,
        height: parseInt(image.height) || null,
      };
    } else {
      this.image = null;
    }
  }

  addItem(item: FeedItem) {
    if (this.items === null || this.items === undefined) {
      this.items = [];
    }
    this.items.push(item);
    this.sortItemsByDate();
  }

  sortItemsByDate() {
    this.items?.sort((a, b) => (new Date(b.pubDate).valueOf()) - (new Date(a.pubDate).valueOf()));
  }
}