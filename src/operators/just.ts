import { Stateless } from '../stateless';

export const just = <T>(value: T) =>
  new Stateless<T>(obs => {
    obs.next(value);
    obs.complete();
  });
