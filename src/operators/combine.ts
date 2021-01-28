import { DerivedState } from '../state';
import { Observable } from '../interface';

export const combine = <T>(input: { [K in keyof T]: Observable<T[K]> }) =>
  new DerivedState<T>((next, dispose) => {
    let active = false;
    let value: any = Array.isArray(input) ? [] : {};
    const entries = Object.entries<Observable<unknown>>(input);
    const unsubs = entries.map(([key, observable]) =>
      observable.subscribe(subvalue => {
        value[key] = subvalue;
        if (active || Object.keys(value).length === entries.length) {
          active = true;
          next(value);
        }
      }, dispose)
    );
    return () => unsubs.forEach(unsub => unsub());
  });
