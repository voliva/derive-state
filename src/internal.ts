import { Observer } from './interface';

export class ObserverList<T> {
  private observers = new Set<Observer<T>>();
  public closed = false;

  addObserver(observer: Observer<T>) {
    if (this.closed) {
      throw new Error("StatelessObservable was closed, can't subscribe");
    }

    this.observers.add(observer);
    return () => {
      this.observers.delete(observer);
    };
  }

  emit(value: T) {
    if (this.closed) {
      throw new Error("Observable was closed, can't emit new value");
    }

    this.observers.forEach(observer => observer.next(value));
  }

  close() {
    this.observers.forEach(observer => observer.complete());
    this.observers.clear();
    this.closed = true;
  }
}

export const noop = () => void 0;
