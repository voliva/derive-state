import { DerivedState } from '../state';
import { Observable } from '../interface';

export const distinctUntilChanged = <T>(
  eqFn: (a: T, b: T) => boolean = (a, b) => a === b
) => (source: Observable<T>) =>
  new DerivedState<T>((next) => {
    let lastValue: T | typeof EMPTY = EMPTY;
    return source.subscribe((value) => {
      if (lastValue === EMPTY || !eqFn(value, lastValue)) {
        next(value);
      }
      lastValue = value;
    });
  });

const EMPTY = Symbol('empty');
