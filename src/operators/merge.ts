import { DerivedState } from '../state';
import { Observable } from '../interface';

export const merge = <T>(observables: Observable<T>[]) =>
  new DerivedState<T>(next => {
    const unsubs = observables.map(observable => observable.subscribe(next));
    return () => unsubs.forEach(unsub => unsub());
  });
