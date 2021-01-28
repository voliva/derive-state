import { DerivedState } from '../state';
import { Observable } from '../interface';

export const take = (n: number) => <T>(source: Observable<T>) =>
  new DerivedState<T>(obs => {
    if (n < 1) {
      return obs.complete();
    }

    let i = 0;
    const unsub = source.subscribe(v => {
      if (i < n) {
        obs.next(v);
      }
      i++;
      if (i >= n) {
        if (unsub) unsub();
        obs.complete();
      }
    }, obs.complete);
    if (i >= n) {
      unsub();
      obs.complete();
    }
    return unsub;
  });
