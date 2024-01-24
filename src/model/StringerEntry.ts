import { Content, Entry } from "@nooptoday/feed-rs";
import { parse as parseHtml } from 'node-html-parser';

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
};

export class StringerEntry {
  private props: StringerEntryProps;

  constructor (props: StringerEntryProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
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

  get content(): Content | undefined {
    return this.props.content;
  }

  get summary(): string | undefined {
    return this.props.summary;
  }



  toPersistance(): PersistanceEntryDTO {
    return {
      ...this.props,
      published: this.props.published?.toISOString(),
      updated: this.props.updated?.toISOString(),
      authors: JSON.stringify(this.props.authors),
      content: JSON.stringify(this.props.content),
      links: JSON.stringify(this.props.links),
      categories: JSON.stringify(this.props.categories)
    };
  }

  static fromPersistance(p: StringerEntryDTO): StringerEntry {
    const props = {
      ...p,
      authors: p.authors ? JSON.parse(p.authors) : [],
      content: p.content ? JSON.parse(p.content) : undefined,
      links: p.links ? JSON.parse(p.links) : [],
      categories: p.categories ? JSON.parse(p.categories) : []
    };
    return new StringerEntry(props);
  }

  static fromRemote(
    entry: Entry,
    feedId: string
  ): StringerEntry {
    const hasher = new Bun.CryptoHasher("md5");
    const idHash = hasher.update(entry.id);
    const id = idHash.digest("base64");
    const summary = entry.summary ? stripHtml(entry.summary.content) : undefined;

    const props = {
      id: id,
      rssId: entry.id,
      feedId: feedId,
      title: entry.title?.content,
      updated: entry.updated,
      published: entry.published,
      authors: entry.authors?.map((a) => (
        { name: a.name, uri: a.uri, email: a.email }
      )),
      content: entry.content,
      links: entry.links?.map((l) => l.href),
      summary: summary,
      categories: entry.categories?.map((c) => c.term)
    };
    return new StringerEntry(props);
  }
}

function stripHtml(html: string): string {
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
};