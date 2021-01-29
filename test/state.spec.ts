import { State } from '../src';

describe('State', () => {
  it('holds a value', () => {
    const state = new State(5);
    expect(state.getValue()).toBe(5);

    state.setValue(1);
    expect(state.getValue()).toBe(1);
  });

  it('notifies every subscriber when the state changes', () => {
    const state = new State(5);
    const next1 = jest.fn();
    const next2 = jest.fn();
    state.subscribe(next1);
    state.subscribe(next2);

    expect(next1).toHaveBeenCalledTimes(1);
    expect(next1).toHaveBeenLastCalledWith(5);
    expect(next2).toHaveBeenCalledTimes(1);
    expect(next2).toHaveBeenLastCalledWith(5);

    state.setValue(1);
    expect(next1).toHaveBeenCalledTimes(2);
    expect(next1).toHaveBeenLastCalledWith(1);
    expect(next2).toHaveBeenCalledTimes(2);
    expect(next2).toHaveBeenLastCalledWith(1);
  });

  it('stops notifying when unsubscribe function is called', () => {
    const state = new State(5);
    const next1 = jest.fn();
    const next2 = jest.fn();
    const unsub = state.subscribe(next1);
    state.subscribe(next2);

    unsub();
    state.setValue(1);

    expect(next1).toHaveBeenCalledTimes(1);
    expect(next1).toHaveBeenLastCalledWith(5);
    expect(next2).toHaveBeenCalledTimes(2);
    expect(next2).toHaveBeenLastCalledWith(1);
  });

  it("doesn't have a value when it's empty", () => {
    const state = new State();
    const next = jest.fn();
    state.subscribe(next);

    expect(next).not.toHaveBeenCalled();
    expect(state.hasValue()).toBe(false);
    expect(() => state.getValue()).toThrow();

    state.setValue(1);
    expect(next).toHaveBeenCalledWith(1);
    expect(state.hasValue()).toBe(true);
    expect(state.getValue()).toBe(1);
  });

  it('resolves the value promise when it has a value', async () => {
    // Synchronous
    const s1 = new State(1);
    await expect(s1.value).resolves.toBe(1);

    // Asynchronous
    const s2 = new State();
    const value = s2.value;

    s2.setValue(2);

    await expect(value).resolves.toBe(2);
  });

  it('rejects the value promise when it completes being empty', async () => {
    // Synchronous
    const s1 = new State();
    s1.close();
    await expect(s1.value).rejects.toThrow();

    // Asynchronous
    const s2 = new State();
    const value = s2.value;
    s2.close();

    return expect(value).rejects.toThrow();
  });
});
