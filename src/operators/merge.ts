import { DerivedState } from '../state';
import { Observable } from '../interface';

export const merge = <T>(observables: Observable<T>[]) =>
  new DerivedState<T>(obs => {
    let activeSubs = observables.length;
    if (activeSubs === 0) {
      return obs.complete();
    }
    const unsubs = observables.map(observable =>
      observable.subscribe(obs.next, () => {
        activeSubs--;
        if (activeSubs === 0) {
          obs.complete();
        }
      })
    );
    return () => unsubs.forEach(unsub => unsub());
  });
