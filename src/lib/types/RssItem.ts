import type { Enclosure } from "rss-parser";
import { Item } from 'rss-parser';

export interface RssItem {
  title?: string;
  author?: string;
  creator?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  "content:encoded"?: string;
  contentSnippet?: string;
  enclosure?: Enclosure;
}