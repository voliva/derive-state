import { Observable, ObservableState } from './interface';
import { skipSynchronous } from './operators';

export class DerivedStateless<T> implements Observable<T> {
  private observers = new Set<(value: T) => void>();

  constructor(derive: (next: (value: T) => void) => void) {
    derive(next => {
      this.observers.forEach(observer => observer(next));
    });
  }

  subscribe(callback: (value: T) => void) {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }
}

export class Stateless<T> implements Observable<T> {
  private observers = new Set<(value: T) => void>();

  emit(value: T) {
    this.observers.forEach(observer => observer(value));
  }

  subscribe(callback: (value: T) => void) {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }
}

export const asStateless = <T>(observable: ObservableState<T>) =>
  new DerivedStateless(next => skipSynchronous()(observable).subscribe(next));
