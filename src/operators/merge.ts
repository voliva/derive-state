import { DerivedState } from '../state';
import { Observable } from '../interface';

export const merge = <T>(observables: Observable<T>[]) =>
  new DerivedState<T>((next, dispose) => {
    const unsubs = observables.map(observable =>
      observable.subscribe(next, dispose)
    );
    return () => unsubs.forEach(unsub => unsub());
  });
