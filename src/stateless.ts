import { Observable, ObservableState } from './interface';
import { noop, ObserverList } from './internal';
import { skipSynchronous } from './operators';

export class DerivedStateless<T> implements Observable<T> {
  private observerList = new ObserverList<T>();
  private teardown: () => void;

  constructor(derive: (next: (value: T) => void) => void | (() => void)) {
    this.teardown = derive(next => this.observerList.emit(next)) || noop;
  }

  subscribe(callback: (value: T) => void, disposed?: () => void) {
    return this.observerList.addObserver(callback, disposed);
  }

  dispose() {
    this.teardown();
    this.observerList.dispose();
  }
}

export class Stateless<T> extends DerivedStateless<T> {
  private next: (value: T) => void;

  constructor() {
    let capturedNext: (value: T) => void;
    super(next => {
      capturedNext = next;
    });
    this.next = capturedNext!;
  }

  emit(newState: T) {
    this.next(newState);
  }
}

export const asStateless = <T>(observable: ObservableState<T>) =>
  new DerivedStateless(next => skipSynchronous()(observable).subscribe(next));
