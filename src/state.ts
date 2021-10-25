import { Observer, Operator, PipeFn, StateObservable } from './interface';
import { noop, ObserverList } from './internal';

export class State<T> implements StateObservable<T> {
  private observerList = new ObserverList<T>();
  private state: T | typeof EMPTY = EMPTY;
  private teardown: () => void = noop;

  constructor(initialValue?: T) {
    if (arguments.length >= 1) {
      this.state = initialValue!;
    }
  }

  setValue(newState: T) {
    if (this.observerList.closed) {
      throw new Error("Can't set the value of a closed ObservableState");
    }
    this.state = newState;
    this.observerList.emit(newState);
  }

  subscribe(next: (value: T) => void, complete?: () => void) {
    const observer: Observer<T> = {
      next,
      complete: complete || noop,
    };

    if (this.observerList.closed) {
      if (this.state !== EMPTY) next(this.state);
      complete?.();
      return noop;
    }

    const unsub = this.observerList.addObserver(observer);
    if (this.state !== EMPTY) next(this.state);
    return unsub;
  }

  pipe: PipeFn<T> = (...operators: Operator<any, any>[]) => {
    const [first, ...rest] = operators;
    let current = first(this);
    rest.forEach(operator => {
      current = operator(current);
    });
    return current;
  };

  appendTeardown(teardown: () => void) {
    const old = this.teardown;
    this.teardown = () => {
      old();
      teardown();
    };
  }
  close() {
    this.teardown();
    this.observerList.close();
  }

  hasValue() {
    return this.state !== EMPTY;
  }
  getValue() {
    if (this.state === EMPTY) {
      throw new Error(
        "Can't retreive the value of the ObservableState, as it's empty"
      );
    }
    return this.state;
  }

  get value() {
    return new Promise<T>((resolve, reject) => {
      if (this.hasValue()) return resolve(this.getValue());
      const unsub = this.subscribe(
        v => {
          unsub();
          resolve(v);
        },
        () => reject(new Error('ObservableState completed without any value'))
      );
    });
  }

  get closed() {
    return this.observerList.closed;
  }
}

const EMPTY = Symbol('empty');
