import { Entry, Feed, FeedType, Image } from "@nooptoday/feed-rs";
import { StringerEntry } from "./StringerEntry";

export interface FeedProps {
  id: string,
  feedType: FeedType,
  title: string,
  updated?: Date,
  description?: string,
  feedLink?: string,
  siteLink?: string,
  categories?: string[],
  icon?: Image,
  logo?: string,
  entries?: StringerEntry[];
}

export class StringerFeed {
  private props: FeedProps;

  constructor (props: FeedProps) {
    this.props = props;
  }

  id(): string {
    return this.props.id;
  }

  addEntry(e: Entry): void {

  }

  toPersistence() {
    return {
      ...this.props,
      icon: JSON.stringify(this.props.icon),
      logo: JSON.stringify(this.props.logo),
    };
  }

  static fromPersistence(p: any): StringerFeed {
    const props = {
      ...p,
      icon: JSON.parse(p.icon),
      logo: JSON.parse(p.logo)
    };
    return new StringerFeed(props);
  }

}