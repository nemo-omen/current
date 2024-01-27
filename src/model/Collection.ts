import { CurrentEntry } from './CurrentEntry';
import { Model } from './Model';

export interface CollectionProps {
  id?: number;
  userId: number;
  title: string;
  created?: Date;
  updated?: Date;
  entries?: CurrentEntry[];
}

export class Collection implements Model<Collection> {
  props: CollectionProps;

  constructor (props: CollectionProps) {
    this.props = props;
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get userId(): number | undefined {
    return this.props.userId;
  }

  get title(): string {
    return this.props.title;
  }

  get entries(): CurrentEntry[] | undefined {
    return this.props.entries;
  }

  toPersistance(): PersistanceCollectionDTO {
    return {
      ...this.props,
      created: this.props.created?.toISOString(),
      updated: this.props.updated?.toISOString()
    };
  }

  static fromPersistance(dto: PersistanceCollectionDTO): Collection {
    const props = {
      ...dto,
      created: new Date(dto.created!),
      updated: new Date(dto.updated!)
    };
    return new Collection(props);
  }
}

export interface PersistanceCollectionDTO {
  id?: number;
  userId: number;
  title: string;
  created?: string;
  updated?: string;
}