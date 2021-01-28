import { Observable, ObservableState, Observer } from './interface';
import { noop, ObserverList } from './internal';

export class DerivedStateless<T> implements Observable<T> {
  private observerList = new ObserverList<T>();
  private teardown: () => void;

  constructor(derive: (observer: Observer<T>) => void | (() => void)) {
    this.teardown =
      derive({
        next: next => this.observerList.emit(next),
        complete: () => this.close(),
      }) || noop;
  }

  subscribe(next: (value: T) => void, complete?: () => void) {
    const observer: Observer<T> = {
      next,
      complete: complete || noop,
    };

    if (this.observerList.closed) {
      observer.complete();
      return noop;
    }

    return this.observerList.addObserver(observer);
  }

  close() {
    this.teardown();
    this.observerList.close();
  }
}

export class Stateless<T> extends DerivedStateless<T> {
  private next: (value: T) => void;

  constructor() {
    let capturedObserver: Observer<T>;
    super(obs => {
      capturedObserver = obs;
    });
    this.next = (v: T) => capturedObserver!.next(v);
  }

  emit(newState: T) {
    this.next(newState);
  }
}

export const asStateless = <T>(observable: ObservableState<T>) =>
  new DerivedStateless(obs => observable.subscribe(obs.next, obs.complete));
