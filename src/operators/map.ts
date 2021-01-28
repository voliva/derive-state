import { DerivedState } from '../state';
import { Observable } from '../interface';

export const map = <T, R>(mapFn: (value: T) => R) => (source: Observable<T>) =>
  new DerivedState<R>((next, dispose) =>
    source.subscribe(value => next(mapFn(value)), dispose)
  );
