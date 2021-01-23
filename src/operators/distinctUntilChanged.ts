import { DerivedState } from '../state';
import { Observable } from '../interface';

export const distinctUntilChanged = <T>() => (source: Observable<T>) =>
  new DerivedState<T>(next => {
    let lastValue: T | typeof EMPTY = EMPTY;
    return source.subscribe(value => {
      if (value !== lastValue) {
        next(value);
      }
      lastValue = value;
    });
  });

const EMPTY = Symbol('empty');
