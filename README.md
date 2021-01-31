# DeriveState

State library that implements the Observer pattern, built with reactivity and composition in mind.

Heavily inspired from RxJS, but while RxJS focuses on asynchronous values, DeriveState focuses on stateful boxes, (aka cells in a spreadsheet) - As if everything were a `BehaviourSubject`, and you create new states deriving them from other states.

Experimental

## Usage

## State

```ts
import { State } from 'derive-state';

const apples = new State(0);

apples.subscribe(apples => console.log(`We now have ${apples} apple(s)`));
// Logs "We now have 0 apple(s)"

apples.setValue(2);
// Logs "We now have 2 apple(s)"

console.log('apples: ' + apples.getValue());
// Logs "apples: 2"
```

The initial value is optional: if omitted the state will be empty

```ts
import { State } from 'derive-state';

const apples = new State();

apples.subscribe(apples => console.log(`We now have ${apples} apple(s)`));
// Doesn't log anything

// We can't read the value synchronously in this case
expect(() => apples.getValue()).toThrow();

// We have a function that tell us whether it holds a value or not
expect(apples.hasValue()).toBe(false);

// Or we can get a promise for when it finally has a value
apples.value.then(v => console.log(`Promise resolved with ${v}`));

apples.setValue(2);
// Logs "We now have 2 apple(s)" followed by "Promise resolved with 2"

expect(apples.hasValue()).toBe(true);
```

Subscriptions and state can both get cleaned up:

```ts
import { State } from 'derive-state';

const apples = new State(0);

const unsub1 = apples.subscribe(
  apples => console.log(`We now have ${apples} apple(s)`)
  () => console.log("complete")
);
// Logs "We now have 0 apple(s)"

unsub1();
apples.setValue(2);
// Doesn't log anything

apples.subscribe(
  apples => console.log(`We now have ${apples} apple(s)`)
  () => console.log("complete")
);
// Logs "We now have 2 apple(s)"

apples.close();
// Logs "complete"

// We can't set the value of a closed state.
//     As semantically it means this value won't ever change again.
expect(() => apples.setValue(5)).toThrow();

// But we can still read the value
console.log('apples: ' + apples.getValue());
// Logs "apples: 2"

// And subscribe (it will just call back and close the subscription immediately)
apples.subscribe(
  apples => console.log(`We now have ${apples} apple(s)`)
  () => console.log("complete")
);
// Logs "We now have 2 apple(s)" followed by "complete"
```

## Stateless

An stateless observable doesn't hold any value.
It has two main ways it can be used:

### Similar to an event emitter

```ts
import { Stateless } from 'derive-state';

const clicks = new Stateless();
clicks.emit('click');
clicks.subscribe(() => console.log('received a click'));
// Logs nothing

clicks.emit('click');
// Logs "received a click"
```

### Derived from another observable

```ts
import { Stateless } from 'derive-state';
const apples = new State(2);
const squaredApples = new Stateless(obs => {});

const squaredApples = new Stateless(obs =>
  apples.subscribe(apples => obs.next(apples * apples), obs.complete)
);
squaredApples.subscribe(apples =>
  console.log(`We now have ${apples} squared apple(s)`)
);
// Logs "We now have 4 squared apple(s)"

// Equivalent when using `pipe`:
const pipedSquaredApples = apples.pipe(map(apples => apples * apples));
```

**A stateless is lazy**: Meaning it won't run the derive function until someone subscribes to it.

**A stateless is multicast**: It will share the derive function along all the subscribers in the chain.

Stateless are designed to make composition easily: This way we can write operators that define their behaviour, and we can compose them easily with `pipe`.

Note that this has an apparent issue:

```ts
const squaredApples = apples.pipe(map(apples => apples * apples));
squaredApples.subscribe(apples =>
  console.log(`We now have ${apples} squared apple(s)`)
);
// Logs "We now have 4 squared apple(s)"

squaredApples.subscribe(apples =>
  console.log(`We now have ${apples} squared apple(s)`)
);
// Doesn't log anything
```

This is due to the nature of `squaredApples` being stateless and multicast: By the time the second subscriber comes in, `apples` has already emitted its value, so it won't receive it. When `apple` changes, both subscribers will receive the new value.

That's why usually you would `capture` these stateless observables into stateful observables. The trade-off is that while stateless observables get cleaned up when they don't have subscriptions, stateful observables as they hold a value they need cleaning up, that's why you'd call `capture` only after you've applied the composed operator chain

```ts
const pears = new State(10);

// eq. combineLatest in rxjs
const totalFruits = combine([apples, pears])
  .pipe(map(([apples, pears]) => apples + pears))
  .capture();

totalFruits.subscribe(fruits => console.log(`We now have ${fruits} fruits`));
// Logs "We now have 12 fruits"

totalFruits.subscribe(fruits => console.log(`We now have ${fruits} fruits`));
// Logs "We now have 12 fruits"
```

### Operators

Creation operators

- `just(value)`: Emits `value` on the first subscription.
- `combine(obj)`: subscribes to every observable in `obj`, and emits the value of all of them in the same structure as `obj` (works with arrays too)
- `merge(array)`: subscribes to all the observables in array and emits every value from them.

Pipeable operators

- `map(fn)`: maps the values from the source stream by using the map function.
- `filter(fn)`: filters changes based on the filter function.
- `distinctUntilChanged()`: prevents emitting the same value twice in a row.
- `switchMap(fn)`: flattens out the observable returned by the map function, unsubscribing from the previous ones.
- `take(n)`: updates at most N times.
- `skip(n)`: skips the first N values.
- `withDefault(value)`: adds in a value if none is present.
- `scan(accumulator, initialValue?)`: accumulates and emits values using the accumulator function
