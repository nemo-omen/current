import { Content, Entry, MediaObject, Person } from "@nooptoday/feed-rs";
import { parse as parseHtml } from 'node-html-parser';
import { Image } from '@nooptoday/feed-rs';
export type StringerEntryProps = {
  id: string,
  rssId?: string,
  feedId?: string,
  title?: string,
  updated?: Date,
  published?: Date,
  authors?: {
    name?: string,
    uri?: string,
    email?: string;
  }[],
  content?: {
    contentType: string,
    body?: string;
  },
  links?: string[],
  summary?: string,
  categories?: string[],
  media?: MediaObject[],
  feedTitle?: string,
  feedLogo?: Image,
  feedIcon?: Image,
};

export class StringerEntry {
  private props: StringerEntryProps;

  constructor (props: StringerEntryProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get rssId(): string | undefined {
    return this.props.rssId;
  }

  get feedId(): string | undefined {
    return this.props.feedId;
  }

  get title(): string | undefined {
    return this.props.title;
  }

  get updated(): Date | undefined {
    return this.props.updated;
  }

  get published(): Date | undefined {
    return this.props.published;
  }

  get authors(): { name?: string, uri?: string, email?: string; }[] | undefined {
    return this.props.authors;
  }

  get content(): Content | undefined {
    return this.props.content;
  }

  get links(): string[] | undefined {
    return this.props.links;
  }

  get summary(): string | undefined {
    return this.props.summary;
  }

  get categories(): string[] | undefined {
    return this.props.categories;
  }

  get media(): MediaObject[] | undefined {
    return this.props.media;
  }

  get feedTitle(): string | undefined {
    return this.props.feedTitle;
  }

  get feedLogo(): Image | undefined {
    return this.props.feedLogo;
  }

  get feedIcon(): Image | undefined {
    return this.props.feedIcon;
  }

  toPersistance(): PersistanceEntryDTO {
    return {
      ...this.props,
      published: this.props.published?.toISOString(),
      updated: this.props.updated?.toISOString(),
      authors: JSON.stringify(this.props.authors),
      content: JSON.stringify(this.props.content),
      links: JSON.stringify(this.props.links),
      categories: JSON.stringify(this.props.categories),
      media: JSON.stringify(this.props.media),
      feedLogo: JSON.stringify(this.props.feedLogo),
      feedIcon: JSON.stringify(this.props.feedIcon)
    };
  }

  static fromPersistance(p: PersistanceEntryDTO): StringerEntry {
    const props = {
      ...p,
      published: p.published ? new Date(p.published) : undefined,
      updated: p.updated ? new Date(p.updated) : undefined,
      authors: p.authors ? JSON.parse(p.authors) : [],
      content: p.content ? JSON.parse(p.content) : undefined,
      links: p.links ? JSON.parse(p.links) : [],
      categories: p.categories ? JSON.parse(p.categories) : [],
      media: p.media ? JSON.parse(p.media) : undefined,
      feedLogo: p.feedLogo ? JSON.parse(p.feedLogo) : undefined,
      feedIcon: p.feedIcon ? JSON.parse(p.feedIcon) : undefined
    };
    return new StringerEntry(props);
  }

  static fromRemote(
    entry: Entry,
    feedId: string,
    feedTitle?: string,
    feedLogo?: Image,
    feedIcon?: Image
  ): StringerEntry {
    const hasher = new Bun.CryptoHasher("md5");
    const idHash = hasher.update(entry.id);
    const id = idHash.digest("hex");
    let summary: string | undefined = undefined;
    let pubDate: Date | undefined = undefined;

    if (entry.summary) {
      if (entry.summary.contentType === 'text/html') {
        summary = getInnerText(entry.summary.content);
      } else {
        summary = entry.summary.content;
      }
    } else {
      if (entry.content) {
        if (entry.content.body) {
          summary = makeSummaryFromContent(entry.content.body);
        }
      }
    }

    if (entry.published) {
      pubDate = entry.published;
    } else if (entry.updated) {
      pubDate = entry.updated;
    }

    const props = {
      id: id,
      rssId: entry.id,
      feedId: feedId,
      title: entry.title?.content,
      updated: entry.updated,
      published: pubDate,
      authors: entry.authors?.map((a) => (
        { name: a.name, uri: a.uri, email: a.email }
      )),
      content: entry.content,
      links: entry.links?.map((l) => l.href),
      summary: summary,
      categories: entry.categories?.map((c) => c.term),
      media: entry.media,
      feedTitle,
      feedLogo,
      feedIcon
    };
    return new StringerEntry(props);
  }
}

function getInnerText(html: string): string {
  const document = parseHtml(html);
  return document.innerText;
}

function makeSummaryFromContent(html: string): string {
  const document = parseHtml(html);
  const p = document.querySelector('p');
  if (p) {
    return p.innerText;
  }
  return '';
}

export interface PersistanceEntryDTO {
  id: string,
  rssId?: string,
  feedId?: string,
  title?: string,
  updated?: string,
  published?: string,
  authors?: string,
  content?: string,
  links?: string,
  summary?: string,
  categories?: string,
  media?: string,
  feedLogo?: string,
  feedTitle?: string,
  feedIcon?: string,
};

export interface StringerEntryDTO {
  id: string,
  rssId?: string,
  feedId?: string,
  title?: string,
  updated?: Date,
  published?: Date,
  authors?: string,
  content?: string,
  links?: string,
  summary?: string,
  categories?: string,
  media?: MediaObject[],
  feedLogo?: Image,
  feedTitle: string,
  feedIcon?: Image;
};