export interface Observable<T> {
  subscribe(callback: (value: T) => void, disposed?: () => void): () => void;
  dispose(): void;
}

export interface ObservableState<T> extends Observable<T> {
  value: Promise<T>;
  hasValue(): boolean;
  getValue(): T;
}

export interface Observer<T> {
  next: (value: T) => void;
  disposed: () => void;
}
