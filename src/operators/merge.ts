import { DerivedState } from '../state';
import { Observable } from '../interface';

export const merge = <T>(observables: Observable<T>[]) =>
  new DerivedState<T>(next => {
    observables.forEach(observable => {
      observable.subscribe(next);
    });
  });
