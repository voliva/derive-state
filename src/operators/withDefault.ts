import { DerivedState } from '../state';
import { Observable } from '../interface';

export const withDefault = <T>(value: T) => <S>(source: Observable<S>) =>
  new DerivedState<S | T>((next, dispose) => {
    next(value);
    return source.subscribe(next, dispose);
  });
