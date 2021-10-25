import {
  StateObservable,
  Observer,
  Operator,
  StatelessObservable,
  PipeFn,
} from './interface';
import { noop, ObserverList } from './internal';
import { State } from './state';

export class Stateless<T> implements StatelessObservable<T> {
  private observerList = new ObserverList<T>();
  private teardown: () => void = noop;
  private start: (observer: Observer<T>) => void | (() => void);

  constructor(derive: (observer: Observer<T>) => void | (() => void) = noop) {
    this.start = derive;
  }

  emit(next: T) {
    this.observerList.emit(next);
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

    const unsub = this.observerList.addObserver(observer);
    if (this.observerList.size === 1) {
      this.teardown =
        this.start({
          next: v => this.emit(v),
          complete: () => {
            this.teardown();
            this.teardown = noop;
            this.observerList.complete();
          },
        }) || noop;
    }

    // Synchronous complete: Teardown assigned after start
    if (this.observerList.size === (0 as any)) {
      this.teardown();
      return noop;
    }

    return () => {
      unsub();
      if (this.observerList.size === 0) {
        this.teardown();
        this.teardown = noop;
      }
    };
  }

  close() {
    this.teardown();
    this.observerList.close();
  }

  pipe: PipeFn<T> = (...operators: Operator<any, any>[]) => {
    const [first, ...rest] = operators;
    let current = first(this);
    rest.forEach(operator => {
      current = operator(current);
    });
    return current;
  };

  capture() {
    const state = new State<T>();
    const unsub = this.subscribe(
      n => state.setValue(n),
      () => state.close()
    );
    state.appendTeardown(unsub);
    return state as StateObservable<T>;
  }

  get closed() {
    return this.observerList.closed;
  }
}

export const asStateless = <T>(observable: StateObservable<T>) =>
  new Stateless(obs => observable.subscribe(obs.next, obs.complete));
