import { RssItem } from "./RssItem";


export interface RssFeed {
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
  items?: RssItem[];
}