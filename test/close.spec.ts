import { Stateless, State } from '../src';

describe('complete', () => {
  it('closes a stream', () => {
    const state = new State(5);
    const notify = jest.fn();

    state.subscribe(() => void 0, notify);
    expect(notify).not.toBeCalled();

    state.close();
    expect(notify).toBeCalled();
    expect(state.getValue()).toEqual(5);
    expect(() => state.setValue(1)).toThrow();
    expect(state.getValue()).toEqual(5);

    const next = jest.fn();
    const complete = jest.fn();
    state.subscribe(next, complete);
    expect(next).toHaveBeenCalledWith(5);
    expect(complete).toHaveBeenCalled();
  });

  it('closes a stream chain', () => {
    const state = new State(5);
    const d0 = new Stateless(obs => state.subscribe(obs.next, obs.complete));
    const d1 = new Stateless(obs => d0.subscribe(obs.next, obs.complete));

    const n1 = jest.fn();
    const n2 = jest.fn();
    const n3 = jest.fn();

    state.subscribe(() => void 0, n1);
    d0.subscribe(() => void 0, n2);
    d1.subscribe(() => void 0, n3);

    state.close();
    expect(n1).toBeCalled();
    expect(n2).toBeCalled();
    expect(n3).toBeCalled();
  });

  it('only closes the streams that depend on it', () => {
    const state = new State(5);
    const d0 = new Stateless(obs =>
      state.subscribe(obs.next, obs.complete)
    ).capture();
    const d1 = new Stateless(obs =>
      d0.subscribe(obs.next, obs.complete)
    ).capture();

    const n1 = jest.fn();
    const n2 = jest.fn();
    const n3 = jest.fn();

    state.subscribe(() => void 0, n1);
    d0.subscribe(() => void 0, n2);
    d1.subscribe(() => void 0, n3);

    d0.close();
    expect(n1).not.toBeCalled();
    expect(n2).toBeCalled();
    expect(n3).toBeCalled();

    expect(() => state.setValue(1)).not.toThrow();
    expect(d0.getValue()).toEqual(5);
    expect(d1.getValue()).toEqual(5);
  });
});
