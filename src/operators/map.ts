import { Stateless } from '../stateless';
import { Observable } from '../interface';

export const map = <T, R>(mapFn: (value: T) => R) => (source: Observable<T>) =>
  new Stateless<R>(obs =>
    source.subscribe(value => obs.next(mapFn(value)), obs.complete)
  );
