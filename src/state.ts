import { ObservableState } from './interface';
import { noop, ObserverList } from './internal';

export class DerivedState<T> implements ObservableState<T> {
  private observerList = new ObserverList<T>();
  private state: T | typeof EMPTY = EMPTY;
  private teardown: () => void;

  constructor(
    derive: (
      next: (value: T) => void,
      dispose: () => void
    ) => void | (() => void)
  ) {
    this.teardown =
      derive(
        next => {
          if (!this.observerList.closed) this.state = next;
          this.observerList.emit(next);
        },
        () => this.dispose()
      ) || noop;
  }

  subscribe(callback: (value: T) => void, disposed?: () => void) {
    const unsub = this.observerList.addObserver(callback, disposed);
    if (this.state !== EMPTY) callback(this.state);
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
  dispose() {
    this.teardown();
    this.state = EMPTY;
    this.observerList.dispose();
  }

  get value() {
    return new Promise<T>(resolve => {
      if (this.hasValue()) return resolve(this.getValue());
      const unsub = this.subscribe(v => {
        unsub();
        resolve(v);
      });
    });
  }
}

export class State<T> extends DerivedState<T> {
  private next: (value: T) => void;

  constructor(initialValue?: T) {
    const args = arguments;
    let capturedNext: (value: T) => void;
    super(next => {
      capturedNext = next;
      if (args.length >= 1) {
        next(initialValue!);
      }
    });
    this.next = capturedNext!;
  }

  setValue(newState: T) {
    this.next(newState);
  }
}

const EMPTY = Symbol('empty');
