import { ObservableState } from './interface';

export class DerivedState<T> implements ObservableState<T> {
  private observers = new Set<(value: T) => void>();
  private state: T | typeof EMPTY = EMPTY;

  constructor(derive: (next: (value: T) => void) => void) {
    derive(next => {
      this.state = next;
      this.observers.forEach(observer => observer(next));
    });
  }

  subscribe(callback: (value: T) => void) {
    this.observers.add(callback);
    if (this.state !== EMPTY) callback(this.state);
    return () => {
      this.observers.delete(callback);
    };
  }
  hasValue() {
    return this.state !== EMPTY;
  }
  getValue() {
    if (this.state === EMPTY) {
      throw new Error('Empty value');
    }
    return this.state;
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
