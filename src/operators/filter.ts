import { Stateless } from '../stateless';
import { Observable } from '../interface';

export const filter = <T>(filterFn: (value: T) => boolean) => (
  source: Observable<T>
) =>
  new Stateless<T>(obs =>
    source.subscribe(
      value => (filterFn(value) ? obs.next(value) : void 0),
      obs.complete
    )
  );
