import { Stateless } from '../stateless';
import { Observable } from '../interface';

export const distinctUntilChanged = <T>(
  eqFn: (a: T, b: T) => boolean = (a, b) => a === b
) => (source: Observable<T>) =>
  new Stateless<T>(obs => {
    let lastValue: T | typeof EMPTY = EMPTY;
    return source.subscribe(value => {
      if (lastValue === EMPTY || !eqFn(value, lastValue)) {
        obs.next(value);
      }
      lastValue = value;
    }, obs.complete);
  });

const EMPTY = Symbol('empty');
