interface ItemProps {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
}

export class FeedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;

  constructor (props: ItemProps) {
    this.title = props.title;
    this.link = props.link;
    this.pubDate = props.pubDate;
    this.content = props.content;
    this.contentSnippet = props.contentSnippet;
  }
}