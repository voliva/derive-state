import { DerivedState } from '../state';
import { Observable } from '../interface';

export const skip = (n: number) => <T>(source: Observable<T>) =>
  new DerivedState<T>(obs => {
    let i = 0;
    return source.subscribe(v => {
      if (i >= n) {
        obs.next(v);
      } else {
        i++;
      }
    }, obs.complete);
  });
