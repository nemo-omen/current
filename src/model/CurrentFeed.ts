import { Entry, Feed, FeedType, Image } from "@nooptoday/feed-rs";
import { PersistanceEntryDTO, CurrentEntry, CurrentEntryDTO } from "./CurrentEntry";
import kebabCase from 'just-kebab-case';

export interface FeedProps {
  id: string,
  rssId?: string,
  feedType: FeedType,
  title: string,
  updated?: Date,
  description?: string,
  feedLink?: string,
  siteLink?: string,
  categories?: string[],
  icon?: Image,
  logo?: Image,
  entries?: CurrentEntry[];
  slug?: string;
}

export class CurrentFeed {
  private props: FeedProps;

  constructor (props: FeedProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get rssId(): string | undefined {
    return this.props.rssId;
  }

  get title(): string {
    return this.props.title;
  }

  get entries(): CurrentEntry[] {
    return this.props.entries || [];
  }

  set entries(entries: CurrentEntry[]) {
    this.props.entries = entries;
  }

  get icon(): Image | undefined {
    return this.props.icon;
  }

  get logo(): Image | undefined {
    return this.props.logo;
  }

  get feedLink(): string | undefined {
    return this.props.feedLink;
  }

  get siteLink(): string | undefined {
    return this.props.siteLink;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get updated(): Date | undefined {
    return this.props.updated;
  }

  get categories(): string[] {
    return this.props.categories || [];
  }

  get feedType(): FeedType {
    return this.props.feedType;
  }

  get slug() {
    return this.props.slug;
  }

  addEntry(e: Entry): void {

  }

  toPersistance(): PersistanceFeedDTO {
    return {
      ...this.props,
      updated: this.props.updated?.toISOString(),
      categories: JSON.stringify(this.props.categories),
      icon: JSON.stringify(this.props.icon),
      logo: JSON.stringify(this.props.logo),
      entries: this.props.entries?.map((e) => e.toPersistance())
    };
  }

  static fromPersistance(p: any): CurrentFeed {
    const props = {
      ...p,
      updated: new Date(p.updated),
      categories: JSON.parse(p.categories),
      icon: JSON.parse(p.icon),
      logo: JSON.parse(p.logo)
    };
    return new CurrentFeed(props);
  }

  static fromRemote(feed: Feed, siteLink: string, feedLink: string): CurrentFeed {
    const hasher = new Bun.CryptoHasher("md5");
    const idHash = hasher.update(feed.id);
    const id = idHash.digest("hex");

    const props = {
      id: id,
      rssId: feed.id,
      feedType: feed.feedType,
      title: feed.title?.content || '',
      updated: feed.updated,
      description: feed.description?.content || '',
      feedLink: feedLink,
      siteLink: siteLink,
      categories: feed.categories.map((c) => c.term),
      icon: feed.icon,
      logo: feed.logo,
      slug: kebabCase(feed.title!.content) || '',
      entries: feed.entries.map((e) => CurrentEntry.fromRemote(
        e,
        id,
        feed.title?.content,
        feed.logo,
        feed.icon
      ))
    };
    return new CurrentFeed(props);
  }
}

export interface PersistanceFeedDTO {
  id: string,
  rssId?: string,
  feedType: string,
  title: string,
  updated?: string,
  description?: string,
  feedLink?: string,
  siteLink?: string,
  categories?: string,
  icon?: string,
  logo?: string,
  slug?: string,
  entries?: PersistanceEntryDTO[];
}

export interface CurrentFeedDTO {
  id: string,
  rssId?: string,
  feedType: string,
  title: string,
  updated?: Date,
  description?: string,
  feedLink?: string,
  siteLink?: string,
  categories?: string,
  icon?: string,
  logo?: string,
  slug?: string,
  entries?: CurrentEntryDTO[];
}