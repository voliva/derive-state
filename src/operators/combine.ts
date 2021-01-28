import { DerivedState } from '../state';
import { Observable } from '../interface';

export const combine = <T>(input: { [K in keyof T]: Observable<T[K]> }) =>
  new DerivedState<T>(obs => {
    let active = false;
    let value: any = Array.isArray(input) ? [] : {};
    const entries = Object.entries<Observable<unknown>>(input);
    if (entries.length === 0) {
      return obs.complete();
    }
    const unsubs = entries.map(([key, observable]) =>
      observable.subscribe(subvalue => {
        value[key] = subvalue;
        if (active || Object.keys(value).length === entries.length) {
          active = true;
          obs.next(value);
        }
      }, obs.complete)
    );
    return () => unsubs.forEach(unsub => unsub());
  });
