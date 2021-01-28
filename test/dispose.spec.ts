import { DerivedState, State } from '../src';

describe('dispose', () => {
  it('closes a stream', () => {
    const state = new State(5);
    const notify = jest.fn();

    state.subscribe(() => void 0, notify);
    expect(notify).not.toBeCalled();

    state.dispose();
    expect(notify).toBeCalled();
    expect(() => state.getValue()).toThrow();
    expect(() => state.setValue(1)).toThrow();
    expect(() => state.subscribe(() => void 0)).toThrow();
  });

  it('closes a stream chain', () => {
    const state = new State(5);
    const d0 = new DerivedState((next, dispose) =>
      state.subscribe(next, dispose)
    );
    const d1 = new DerivedState((next, dispose) => d0.subscribe(next, dispose));

    const n1 = jest.fn();
    const n2 = jest.fn();
    const n3 = jest.fn();

    state.subscribe(() => void 0, n1);
    d0.subscribe(() => void 0, n2);
    d1.subscribe(() => void 0, n3);

    state.dispose();
    expect(n1).toBeCalled();
    expect(n2).toBeCalled();
    expect(n3).toBeCalled();
  });

  it('only closes the streams that depend on it', () => {
    const state = new State(5);
    const d0 = new DerivedState((next, dispose) =>
      state.subscribe(next, dispose)
    );
    const d1 = new DerivedState((next, dispose) => d0.subscribe(next, dispose));

    const n1 = jest.fn();
    const n2 = jest.fn();
    const n3 = jest.fn();

    state.subscribe(() => void 0, n1);
    d0.subscribe(() => void 0, n2);
    d1.subscribe(() => void 0, n3);

    d0.dispose();
    expect(n1).not.toBeCalled();
    expect(n2).toBeCalled();
    expect(n3).toBeCalled();

    expect(() => state.setValue(1)).not.toThrow();
  });
});
