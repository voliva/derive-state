import { Stateless } from '../src';

describe('Stateless', () => {
  it('notifies every subscriber when a value is emitted', () => {
    const stateless = new Stateless();

    const next1 = jest.fn();
    const next2 = jest.fn();
    stateless.subscribe(next1);
    stateless.subscribe(next2);

    expect(next1).not.toHaveBeenCalled();
    expect(next2).not.toHaveBeenCalled();

    stateless.emit(1);
    expect(next1).toHaveBeenCalledTimes(1);
    expect(next1).toHaveBeenLastCalledWith(1);
    expect(next2).toHaveBeenCalledTimes(1);
    expect(next2).toHaveBeenLastCalledWith(1);
  });

  it("doesn't emit the latest value emitted", () => {
    const stateless = new Stateless();
    stateless.emit(1);

    const next1 = jest.fn();
    stateless.subscribe(next1);

    expect(next1).not.toHaveBeenCalled();

    stateless.emit(2);
    expect(next1).toHaveBeenCalledTimes(1);
    expect(next1).toHaveBeenLastCalledWith(2);
  });

  it('stops notifying when unsubscribe function is called', () => {
    const stateless = new Stateless();
    const next1 = jest.fn();
    const next2 = jest.fn();
    const unsub = stateless.subscribe(next1);
    stateless.subscribe(next2);

    unsub();
    stateless.emit(1);

    expect(next1).not.toHaveBeenCalled();
    expect(next2).toHaveBeenCalledTimes(1);
    expect(next2).toHaveBeenLastCalledWith(1);
  });
});
