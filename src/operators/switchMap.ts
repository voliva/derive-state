import { DerivedState } from '../state';
import { Observable } from '../interface';

export const switchMap = <T, R>(mapFn: (value: T) => Observable<R>) => (
  source: Observable<T>
) =>
  new DerivedState<R>(next => {
    let innerUnsub = (): void => void 0;
    const unsub = source.subscribe(value => {
      innerUnsub();
      innerUnsub = mapFn(value).subscribe(v => next(v));
    });
    return () => {
      innerUnsub();
      unsub();
    };
  });
