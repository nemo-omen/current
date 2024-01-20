import { StringerItem } from "./StringerItem";

export class StringerFeed {
  id?: number;
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
  } | null;
  items?: StringerItem[];

  constructor (
    id?: number,
    title?: string,
    feedUrl?: string,
    description?: string,
    link?: string,
    image?: {
      url: string,
      link?: string,
      title?: string,
      width?: number,
      height?: number,
    },
    items?: StringerItem[],
  ) {
    this.id = id;
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
        width: image.width,
        height: image.height,
      };
    } else {
      this.image = null;
    }
  }

  addItem(item: StringerItem) {
    if (this.items === null || this.items === undefined) {
      this.items = [];
    }
    this.items.push(item);
    this.sortItemsByDate();
  }

  sortItemsByDate() {
    this.items?.sort((a, b) => (new Date(b.pubDate).valueOf()) - (new Date(a.pubDate).valueOf()));
  }

  static fromPersistance(f: StringerFeedPersistDTO) {
    const parsedImg = f.image ? JSON.parse(f.image) : null;
    const props = { ...f, image: parsedImg };
    return new StringerFeed(
      props.id,
      props.title,
      props.feedUrl,
      props.description,
      props.link,
      props.image
    );
  }
}

export type StringerFeedPersistDTO = {
  id?: number,
  feedUrl?: string,
  title?: string,
  description?: string,
  link?: string,
  image?: string,
};

export type StringerFeedPresentDTO = {
  id?: number,
  feedUrl?: string,
  title?: string,
  description?: string,
  link?: string,
  image?: {
    url: string,
    link?: string,
    title?: string,
    width?: number,
    height?: number,
  },
};