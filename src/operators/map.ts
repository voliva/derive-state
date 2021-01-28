import { DerivedState } from '../state';
import { Observable } from '../interface';

export const map = <T, R>(mapFn: (value: T) => R) => (source: Observable<T>) =>
  new DerivedState<R>(obs =>
    source.subscribe(value => obs.next(mapFn(value)), obs.complete)
  );
