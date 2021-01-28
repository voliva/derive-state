import { DerivedState } from '../state';
import { Observable } from '../interface';

export const filter = <T>(filterFn: (value: T) => boolean) => (
  source: Observable<T>
) =>
  new DerivedState<T>((next, dispose) =>
    source.subscribe(value => (filterFn(value) ? next(value) : void 0), dispose)
  );
