import { Observable } from '../interface';
import { ObservableState } from '../interface';

export interface Operator<T, R> {
  (source: Observable<T>): ObservableState<R>;
}

export function pipe<T, R>(
  source: Observable<T>,
  op: Operator<T, R>
): ObservableState<R>;
export function pipe<T, S1, R>(
  source: Observable<T>,
  op0: Operator<T, S1>,
  opN: Operator<S1, R>
): ObservableState<R>;
export function pipe<T, S1, S2, R>(
  source: Observable<T>,
  op0: Operator<T, S1>,
  op1: Operator<S1, S2>,
  opN: Operator<S2, R>
): ObservableState<R>;
export function pipe<T, S1, S2, S3, R>(
  source: Observable<T>,
  op0: Operator<T, S1>,
  op1: Operator<S1, S2>,
  op2: Operator<S2, S3>,
  opN: Operator<S3, R>
): ObservableState<R>;
export function pipe<T, S1, S2, S3, S4, R>(
  source: Observable<T>,
  op0: Operator<T, S1>,
  op1: Operator<S1, S2>,
  op2: Operator<S2, S3>,
  op3: Operator<S3, S4>,
  opN: Operator<S4, R>
): ObservableState<R>;
export function pipe<T>(
  source: Observable<T>,
  ...operators: Operator<any, any>[]
) {
  let current = source;
  operators.forEach(operator => {
    current = operator(current);
  });
  return current;
}
