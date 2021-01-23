export interface Observable<T> {
  subscribe(callback: (value: T) => void): () => void;
}

export interface ObservableState<T> extends Observable<T> {
  value: Promise<T>;
  hasValue(): boolean;
  getValue(): T;
}
