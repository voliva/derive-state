import { Stateless } from '../stateless';
import { Observable } from '../interface';

export const switchMap = <T, R>(mapFn: (value: T) => Observable<R>) => (
  source: Observable<T>
) =>
  new Stateless<R>(obs => {
    let innerUnsub = (): void => void 0;
    let activeSubs = 1;

    const handleComplete = () => {
      activeSubs--;
      if (activeSubs === 0) {
        obs.complete();
      }
    };

    const unsub = source.subscribe(value => {
      innerUnsub();
      activeSubs++;
      const inner$ = mapFn(value) as Observable<R>;
      innerUnsub = inner$.subscribe(v => obs.next(v), handleComplete);
    }, handleComplete);

    return () => {
      innerUnsub();
      unsub();
    };
  });
