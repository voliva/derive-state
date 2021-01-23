import { DerivedState } from '../state';
import { Observable } from '../interface';

export const skipSynchronous = () => <T>(source: Observable<T>) =>
  new DerivedState<T>(next => {
    const state = {
      skip: true,
    };
    const sub = source.subscribe(v => (state.skip ? void 0 : next(v)));
    state.skip = false;
    return sub;
  });
