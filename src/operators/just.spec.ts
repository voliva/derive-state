import { just } from './just';

describe('just', () => {
  it('emits the value synchronoulsy', () => {
    const value = just(5);
    const next = jest.fn();
    const complete = jest.fn();
    value.subscribe(next, complete);

    expect(complete).toBeCalled();
    expect(next).toBeCalledWith(5);
  });

  it('can be reused multiple times', () => {
    const value = just(5);
    value.subscribe(() => 0);
    const next = jest.fn();
    const complete = jest.fn();
    value.subscribe(next, complete);

    expect(complete).toBeCalled();
    expect(next).toBeCalledWith(5);
  });
});
