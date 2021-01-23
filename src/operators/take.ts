import { DerivedState } from '../state';
import { Observable } from '../interface';

export const take = (n: number) => <T>(source: Observable<T>) =>
  new DerivedState<T>(next => {
    let i = 0;
    const unsub = source.subscribe(v => {
      if (i < n) {
        next(v);
      }
      i++;
      if (i >= n) {
        if (unsub) unsub();
      }
    });
    if (i >= n) {
      unsub();
    }
    return unsub;
  });
