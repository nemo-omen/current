export interface SubscriptionProps {
  feedId: string;
  userId: number;
  subscribedAt?: Date;
}

export interface PersistanceSubscriptionDTO {
  feedId: string;
  userId: number;
  subscribedAt?: string;
}

export class Subscription {
  props: SubscriptionProps;

  constructor (subscription: SubscriptionProps) {
    this.props = subscription;
  }
  get feedId(): string { return this.props.feedId; }

  get userId(): number { return this.props.userId; }

  toPersistance(): PersistanceSubscriptionDTO {
    return {
      ...this.props,
      subscribedAt: this.props.subscribedAt?.toISOString()
    };
  }

  static fromPersistance(subscription: PersistanceSubscriptionDTO): Subscription {
    return new Subscription({
      ...subscription,
      subscribedAt: new Date(subscription.subscribedAt!)
    });
  }
}