export interface Observable<T> {
  subscribe(next: (value: T) => void, complete?: () => void): () => void;
  close(): void;
}

export interface ObservableState<T> extends Observable<T> {
  value: Promise<T>;
  hasValue(): boolean;
  getValue(): T;
}

export interface Observer<T> {
  next: (value: T) => void;
  complete: () => void;
}
