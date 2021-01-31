export interface Observable<T> {
  subscribe(next: (value: T) => void, complete?: () => void): () => void;
  close(): void;
  pipe: PipeFn<T>;
}

export interface StateObservable<T> extends Observable<T> {
  value: Promise<T>;
  hasValue(): boolean;
  getValue(): T;
}

export interface StatelessObservable<T> extends Observable<T> {
  capture(): StateObservable<T>;
}

export interface Observer<T> {
  next: (value: T) => void;
  complete: () => void;
}

export interface Operator<T, R> {
  (source: Observable<T>): Observable<R>;
}

interface PipeFn<T> {
  <R>(op: Operator<T, R>): Observable<R>;
  <S1, R>(op0: Operator<T, S1>, opN: Operator<S1, R>): Observable<R>;
  <S1, S2, R>(
    op0: Operator<T, S1>,
    op1: Operator<S1, S2>,
    opN: Operator<S2, R>
  ): Observable<R>;
  <S1, S2, S3, R>(
    op0: Operator<T, S1>,
    op1: Operator<S1, S2>,
    op2: Operator<S2, S3>,
    opN: Operator<S3, R>
  ): Observable<R>;
  <S1, S2, S3, S4, R>(
    op0: Operator<T, S1>,
    op1: Operator<S1, S2>,
    op2: Operator<S2, S3>,
    op3: Operator<S3, S4>,
    opN: Operator<S4, R>
  ): Observable<R>;
}
