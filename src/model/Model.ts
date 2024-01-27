export interface Model<T> {
  props: any;
  toPersistance(): any;
  fromPersistance(props: any): T;
}