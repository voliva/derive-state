# DeriveState

State library that implements the Observer pattern, built with reactivity and composition in mind.

Heavily inspired from RxJS, but while RxJS focuses on asynchronous values, DeriveState focuses on stateful boxes, (aka cells in a spreadsheet) - As if everything were a `BehaviourSubject`, but where you can derive them from other states.

Experimental

## Usage

```ts
import { State, DerivedState } from 'derive-state';

const apples = new State(0);

apples.subscribe(apples => console.log(`We now have ${apples} apple(s)`));
// Logs "We now have 0 apple(s)"

apples.setValue(2);
// Logs "We now have 2 apple(s)"

const squaredApples = new DerivedState(next =>
  apples.subscribe(apples => next(apples * apples))
);
squaredApples.subscribe(apples =>
  console.log(`We now have ${apples} squared apple(s)`)
);
// Logs "We now have 4 squared apple(s)"

// `squaredApples` is a DerivedState, it doesn't have a function `setValue`
// but its state will react to changes from `apples`
apples.setValue(3);
// Logs "We now have 3 apple(s)" "We now have 9 squared apple(s)"
```

DeriveState also exports some operators to help compose states. Internally, all
of them are using `new DerivedState`

Note that pipe is an external function, where the first parameter is the observable
to throw down the pipeline.

```ts
import { pipe, combine, map } from 'derive-state';

const pears = new State(10);

const fruits = pipe(
  combine([apples, pears]), // eq. combineLatest in rxjs
  map(([apples, pears]) => apples + pears)
);
apples.subscribe(apples => console.log(`We have ${fruits} fruit(s) in total`));
// Logs "We have 13 fruit(s) in total"
```

For convenience, it also exposes Stateless observables: those that you will only
get updates from new values.

Note that when deriving a state using any of the exposed operators, it will
result in a stateful observable. DeriveState exports a utility to turn a stateful
observable to a stateless:

```ts
import { Stateless, asStateless } from 'derive-state';

const clicks = new Stateless();
clicks.emit('click');
clicks.subscribe(() => console.log('received a click'));
// Logs nothing

clicks.emit('click');
// Logs "received a click"

const totalClicks = pipe(
  clicks,
  scan(acc => acc + 1, 0) // (scan operator TBD)
);
totalClicks.subscribe(total => console.log(`total clicks: ${total}`));
// Logs "total clicks: 0"

clicks.emit('click');
// Logs "received a click" "total clicks: 1"

const totalClickChanges = asStateless(totalClicks);
totalClickChanges.subscribe(total => console.log('new total clicks: ${total}'));
// Logs nothing

clicks.emit('click');
// Logs "received a click" "total clicks: 2" "new total clicks: 2"

totalClickChanges.subscribe(total => console.log('new total clicks: ${total}'));
// Logs nothing
```

### Operators

- `combine(obj)`: subscribes to every observable in `obj`, and emits the value of all of them in the same structure as `obj` (works with arrays too)
- `merge(array)`: subscribes to all the observables in array and emits every value from them.
- `map(fn)`: maps the values from the source stream by using the map function.
- `filter(fn)`: filters changes based on the filter function.
- `distinctUntilChanged()`: prevents emitting the same value twice in a row.
- `switchMap(fn)`: flattens out the observable returned by the map function, unsubscribing from the previous ones.
- `take(n)`: updates at most N times.
- `withDefault(value)`: adds in a value if none is present.
