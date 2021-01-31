import { Stateless } from '../stateless';
import { Observable, Operator } from '../interface';

interface Scan {
  <T>(accumulator: (acc: T, current: T, index: number) => T): Operator<T, T>;
  <T, R>(
    accumulator: (acc: R, current: T, index: number) => R,
    initialValue: R | (() => R)
  ): Operator<T, R>;
}

export const scan: Scan = function scan<T, R>(
  accumulator: (acc: R, current: T, index: number) => R,
  initialValue?: R | (() => R)
) {
  const hasInitialValue = arguments.length >= 2;

  return (source: Observable<T>) =>
    new Stateless<R>(obs => {
      let acc = hasInitialValue
        ? typeof initialValue === 'function'
          ? (initialValue as any)()
          : initialValue
        : EMPTY;

      if (hasInitialValue) {
        obs.next(acc);
      }
      let index = 0;
      return source.subscribe(value => {
        if (acc === EMPTY) {
          acc = value;
          obs.next(value as any);
          index++;
          return;
        }
        acc = accumulator(acc, value, index);
        index++;
      }, obs.complete);
    });
};

const EMPTY = Symbol('empty');
