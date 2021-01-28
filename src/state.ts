import { ObservableState, Observer } from './interface';
import { noop, ObserverList } from './internal';

export class DerivedState<T> implements ObservableState<T> {
  private observerList = new ObserverList<T>();
  private state: T | typeof EMPTY = EMPTY;
  private teardown: () => void;

  constructor(derive: (observer: Observer<T>) => void | (() => void)) {
    this.teardown =
      derive({
        next: next => {
          if (this.observerList.closed) {
            throw new Error("Can't set the value of a closed ObservableState");
          }
          this.state = next;
          this.observerList.emit(next);
        },
        complete: () => this.close(),
      }) || noop;

    // For synchronous completes
    if (this.observerList.closed) {
      this.teardown();
    }
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
  close() {
    // On synchronous completes, this.teardown can possibly not be defined yet
    this.teardown?.();
    this.observerList.close();
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
}

export class State<T> extends DerivedState<T> {
  private next: (value: T) => void;

  constructor(initialValue?: T) {
    const args = arguments;
    let capturedObserver: Observer<T>;
    super(obs => {
      capturedObserver = obs;
      if (args.length >= 1) {
        obs.next(initialValue!);
      }
    });
    this.next = (v: T) => capturedObserver!.next(v);
  }

  setValue(newState: T) {
    this.next(newState);
  }
}

const EMPTY = Symbol('empty');
