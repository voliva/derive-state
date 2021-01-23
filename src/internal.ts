import { Observer } from './interface';

export class ObserverList<T> {
  private observers = new Set<Observer<T>>();
  public closed = false;

  addObserver(callback: (value: T) => void, disposed?: () => void) {
    if (this.closed) {
      throw new Error("StatelessObservable was closed, can't subscribe");
    }

    const observer = { next: callback, disposed: disposed || noop };
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  emit(value: T) {
    if (this.closed) {
      throw new Error("Observable was closed, can't emit new value");
    }

    this.observers.forEach(observer => observer.next(value));
  }

  dispose() {
    this.observers.forEach(observer => observer.disposed());
    this.observers.clear();
    this.closed = true;
  }
}

export const noop = () => void 0;
