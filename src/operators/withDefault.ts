import { Stateless } from '../stateless';
import { Observable } from '../interface';

export const withDefault = <T>(value: T) => <S>(source: Observable<S>) =>
  new Stateless<S | T>(obs => {
    obs.next(value);
    return source.subscribe(obs.next, obs.complete);
  });
