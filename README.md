# @supercat1337/store2-dom

A collection of DOM binding utilities for reactive stores created by [@supercat1337/store2](https://github.com/supercat1337/store).

## Installation

```bash
npm install @supercat1337/store2-dom
```

## Features

- One‑way and two‑way bindings between reactive atoms/collections and DOM elements
- Automatic cleanup when elements are removed from DOM (`autoDisconnect: true` by default)
- Support for custom event names in two‑way bindings
- TypeScript support via JSDoc (includes `.d.ts`)

## Quick Example

```javascript
import { Store } from '@supercat1337/store2';
import { bindToInput, bindToCheckbox, bindToCssClass, bindToShow } from '@supercat1337/store2-dom';

const store = new Store();
const count = atom(10);
const enabled = atom(true);
const visible = atom(true);
const danger = atom(false);

// Two-way binding with input
const input = document.querySelector('input');
bindToInput(input, count);

// Two-way binding with checkbox
const checkbox = document.querySelector('#enable');
bindToCheckbox(checkbox, enabled);

// Toggle CSS class when danger is true
const span = document.querySelector('.counter');
bindToCssClass(span, danger, 'text-danger');

// Show/hide element
const container = document.querySelector('.container');
bindToShow(container, visible);
```

## API Reference

### One‑way bindings

| Function                                                 | Description                                                                                                                  |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `bindToAttribute(element, reactive, attrName, options?)` | Sets/removes an attribute based on reactive string or null.                                                                  |
| `bindToClassString(element, reactive, options?)`         | Sets `element.className` from a reactive string.                                                                             |
| `bindToCssClass(element, reactive, className, options?)` | Toggles a CSS class based on boolean value. Option `invert` flips the logic.                                                 |
| `bindToDisabled(element, reactive, options?)`            | Sets `element.disabled` from a reactive boolean.                                                                             |
| `bindToHtml(element, reactive, options?)`                | Sets `element.innerHTML` from a reactive string/number.                                                                      |
| `bindToProperty(element, reactive, propName, options?)`  | Sets any DOM property from a reactive value.                                                                                 |
| `bindToShow(element, reactive, options?)`                | Toggles visibility via a CSS class (default `d-none`). Class is applied when value is `false`. Option `invert` changes that. |
| `bindToStyle(element, reactive, options?)`               | Sets `element.style.cssText` from a reactive string, or applies an object of styles (replaces all).                          |
| `bindToDataset(element, reactive, options?)`             | Sets `data-*` attributes from a reactive object (keys become `data-key`). Replaces entire dataset.                           |
| `bindToText(element, reactive, options?)`                | Sets `element.textContent` from a reactive string/number.                                                                    |

### Two‑way bindings

| Function                                                | Description                                                                                                                  |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `bindToCheckbox(checkbox, reactive, options?)`          | Syncs checkbox `checked` property with a boolean atom. Listens to `change` event by default.                                 |
| `bindToCheckboxGroup(checkboxes, collection, options?)` | Syncs a group of checkboxes with a collection of strings (selected values). Listens to `change` event.                       |
| `bindToInput(input, reactive, options?)`                | Syncs input/textarea value with a string/number atom. By default listens to `input` event (or `change` for `type="number"`). |
| `bindToRadioGroup(radios, reactive, options?)`          | Syncs a group of radio buttons (same `name`) with a string atom. Listens to `change` event.                                  |
| `bindToSelect(select, reactive, options?)`              | Syncs a single‑select with a string atom. Listens to `change` event.                                                         |
| `bindToSelectMultiple(select, collection, options?)`    | Syncs a multi‑select with a collection of strings (selected values). Listens to `change` event.                              |

### List binding

| Function                                                                | Description                                                                                                     |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `bindToList(container, collection, itemSetter, itemCreator?, options?)` | Renders a reactive collection into a DOM container. Supports templates and custom element creation.             |
| `ListItemHelper`                                                        | Helper class provided to `itemSetter` and `itemCreator` – gives access to template, item index, and `getDiffs`. |
| `ListItemSetterDetails`                                                 | Contains `itemElement`, `index`, `value`, `oldValue`, `length` for each list item.                              |

### Utilities

| Function                               | Description                                                   |
| -------------------------------------- | ------------------------------------------------------------- |
| `getDiffs(newObj, oldObj, compareFn?)` | Returns an object with `true` for changed/added properties.   |
| `globalOptions`                        | Global defaults: `{ debounceTime: 0, autoDisconnect: true }`. |

## Options

All binding functions accept an optional `options` object:

| Option                   | Type        | Default     | Description                                                                                             |
| ------------------------ | ----------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `debounceTime`           | number      | `0`         | Debounce time (ms) for store subscription.                                                              |
| `autoDisconnect`         | boolean     | `true`      | Automatically unsubscribe when the bound element is removed from DOM.                                   |
| `signal`                 | AbortSignal | `undefined` | AbortSignal that triggers automatic unbinding when aborted. Useful for component lifecycle integration. |
| `event` (two-way)        | string      | depends     | Custom event name for DOM updates (e.g. `'click'`, `'blur'`).                                           |
| `lazy` (input)           | boolean     | `false`     | If `true`, listens to `change` instead of `input`.                                                      |
| `invert` (class toggles) | boolean     | `false`     | If `true`, class is applied when value is `false`.                                                      |
| `hideClassName` (show)   | string      | `'d-none'`  | CSS class used to hide the element.                                                                     |

## Global Options

You can change defaults for all bindings:

```javascript
import { globalOptions } from '@supercat1337/store2-dom';

globalOptions.debounceTime = 100;
globalOptions.autoDisconnect = false;
```

### Using AbortSignal for automatic cleanup

All bindings support the `signal` option, which allows you to automatically unbind when an `AbortSignal` is aborted. This is especially useful in component frameworks.

```javascript
const controller = new AbortController();

const unsubscribe = bindToInput(inputElement, nameAtom, { signal: controller.signal });

// Later, when the component unmounts:
controller.abort(); // automatically cleans up the binding
```

## Working with Deep Objects

`store2-dom` encourages **immutable updates** for deep objects. While it does not automatically track nested mutations (unlike Proxy-based libraries), it provides simple and predictable patterns to handle complex state.

### 1. Immutable Update (Recommended)

Use the spread operator or `Object.assign` to create a new object when updating nested fields:

```js
const user = atom({ name: 'Alex', profile: { age: 25, city: 'New York' } });

// Update a nested field
user.value = {
    ...user.value,
    profile: { ...user.value.profile, age: 26 },
};

// Subscribe to changes
user.subscribe(() => console.log('User updated'));
```

This pattern ensures that changes are always detected and subscribers are notified correctly.

### 2. Atomization (Decompose State)

Instead of a single large atom, split your state into multiple atoms, each responsible for a specific part:

```js
const userName = atom('Alex');
const userAge = atom(25);
const userCity = atom('New York');

// Now each update is isolated and triggers only relevant subscribers
```

### 3. Custom `compareFunction` for Deep Comparison

If you still prefer to mutate objects in-place, you can provide a custom comparison function to `atom` or `collection` that compares the full structure (e.g., using `JSON.stringify` or a deep equality library):

```js
const user = atom(
    { name: 'Alex', profile: { age: 25 } },
    {
        compareFunction: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    }
);

// Now you can mutate and trigger an update by reassigning the same value:
user.value.profile.age = 26;
user.value = user.value; // will notify subscribers
```

> **Note:** This is an escape hatch. The immutable update pattern is **strongly recommended** for clarity, performance, and predictability.

### When to Use Which?

| Scenario                                 | Recommended Pattern                            |
| ---------------------------------------- | ---------------------------------------------- |
| Simple updates on small objects          | Immutable update                               |
| Large state with frequent updates        | Atomization (split into atoms)                 |
| Legacy codebase with deep mutations      | Custom `compareFunction` + `value = value`     |
| Interactive forms with temporary changes | `ShallowReactive` (track top-level props only) |

```


## License

MIT [Albert Bazaleev]
```
