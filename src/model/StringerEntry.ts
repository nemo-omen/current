import { Content, Entry, Feed, Person } from "@nooptoday/feed-rs";

export type StringerEntryProps = {
  id: string,
  feedId?: string,
  title?: string,
  updated?: Date,
  published?: Date,
  authors?: { name?: string, uri?: string, email?: string; }[],
  content?: { contentType: string, body?: string; },
  links?: string[],
  summary?: string,
  categories?: string[],
};

export class StringerEntry {
  private props: StringerEntryProps;

  constructor (props: StringerEntryProps) {
    this.props = props;
  }

  toPersistence() {
    return {
      ...this.props,
      authors: JSON.stringify(this.props.authors),
      content: JSON.stringify(this.props.content),
      links: JSON.stringify(this.props.links),
      categories: JSON.stringify(this.props.categories)
    };
  }

  static fromPersistence(p: any) {
    const props = {
      ...p,
      authors: JSON.parse(p.authors),
      content: JSON.parse(p.content),
      links: JSON.parse(p.links),
      categories: JSON.parse(p.categories)
    };
    return new StringerEntry(props);
  }
}