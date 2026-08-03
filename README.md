# @supercat1337/store2-dom

**DOM binding utilities for reactive stores** — seamlessly connect `@supercat1337/store2` to the DOM.

[![npm version](https://badge.fury.io/js/%40supercat1337%2Fstore2-dom.svg)](https://www.npmjs.com/package/@supercat1337/store2-dom)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@supercat1337/store2-dom)](https://bundlephobia.com/package/@supercat1337/store2-dom)

---

## Why store2-dom?

- **Declarative DOM bindings** – no more manual `addEventListener` and `textContent` updates.
- **Automatic cleanup** – bindings unsubscribe when elements are removed from the DOM (`autoDisconnect: true` by default) using a lightweight `isConnected` check.
- **Framework‑agnostic** – works with vanilla JS, React, Vue, or any DOM environment.
- **Supports `AbortSignal`** – easy integration with component lifecycles.
- **Tiny footprint** – ~13 KB core, depends only on `@supercat1337/store2`.

---

## Installation

```bash
npm install @supercat1337/store2-dom
```

---

## Quick Start

```html
<!-- index.html -->
<input type="text" id="name-input" />
<p id="greeting"></p>
<button id="reset-btn">Reset</button>
```

```js
import { atom, computed } from '@supercat1337/store2';
import { bindToInput, bindToText } from '@supercat1337/store2-dom';

const name = atom('World');
const greeting = computed(() => `Hello, ${name.value}!`);

bindToInput(document.getElementById('name-input'), name);
bindToText(document.getElementById('greeting'), greeting);

// Reset button – directly mutates the atom
document.getElementById('reset-btn').addEventListener('click', () => {
    name.value = 'World';
});
```

Now typing in the input automatically updates the greeting paragraph — **reactive DOM binding in a few lines**.

---

## Core Concepts

| Concept             | Description                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **One‑way binding** | Updates DOM when reactive value changes (store → DOM).                                                                           |
| **Two‑way binding** | Syncs DOM events back to the reactive item (store ↔ DOM).                                                                        |
| **List binding**    | Efficiently renders a `Collection` into a container with minimal DOM operations.                                                 |
| **Auto‑disconnect** | Automatically cleans up subscriptions when the target element is removed from DOM (checks `element.isConnected` on each update). |
| **AbortSignal**     | Use `signal` option to unbind when an `AbortController` is aborted.                                                              |

---

## One‑Way Bindings

| Function                                                 | Description                                                                |
| -------------------------------------------------------- | -------------------------------------------------------------------------- |
| `bindToAttribute(element, reactive, attrName, options?)` | Sets/removes an attribute based on reactive string or `null`.              |
| `bindToClassString(element, reactive, options?)`         | Sets `element.className` from a reactive string.                           |
| `bindToCssClass(element, reactive, className, options?)` | Toggles a CSS class based on boolean value. `invert` flips logic.          |
| `bindToDisabled(element, reactive, options?)`            | Sets `element.disabled` from a reactive boolean.                           |
| `bindToHtml(element, reactive, options?)`                | Sets `element.innerHTML` from a reactive string/number.                    |
| `bindToProperty(element, reactive, propName, options?)`  | Sets any DOM property from a reactive value.                               |
| `bindToShow(element, reactive, options?)`                | Toggles visibility via a CSS class (default `d-none`).                     |
| `bindToStyle(element, reactive, options?)`               | Sets `element.style.cssText` from a string or applies an object of styles. |
| `bindToDataset(element, reactive, options?)`             | Sets `data-*` attributes from a reactive object (replaces all).            |
| `bindToText(element, reactive, options?)`                | Sets `element.textContent` from a reactive string/number.                  |

---

## Two‑Way Bindings

| Function                                                | Description                                                                 |
| ------------------------------------------------------- | --------------------------------------------------------------------------- |
| `bindToCheckbox(checkbox, reactive, options?)`          | Syncs checkbox `checked` with a boolean atom.                               |
| `bindToCheckboxGroup(checkboxes, collection, options?)` | Syncs a group of checkboxes with a collection of strings (selected values). |
| `bindToInput(input, reactive, options?)`                | Syncs input/textarea value with a string/number atom.                       |
| `bindToRadioGroup(radios, reactive, options?)`          | Syncs a group of radios (same `name`) with a string atom.                   |
| `bindToSelect(select, reactive, options?)`              | Syncs a single‑select with a string atom.                                   |
| `bindToSelectMultiple(select, collection, options?)`    | Syncs a multi‑select with a collection of strings.                          |

---

## List Binding (`bindToList`)

Efficiently render a reactive `Collection` into a container.

```js
import { collection } from '@supercat1337/store2';
import { bindToList } from '@supercat1337/store2-dom';

const todos = collection([{ id: 1, text: 'Learn store2' }]);

bindToList(
    document.getElementById('todo-list'),
    todos,
    (helper, { itemElement, value, oldValue }) => {
        const span = itemElement.querySelector('span');
        if (helper.getDiffs({ text: value }, { text: oldValue }).text) {
            span.textContent = value.text;
        }
    }
);
```

- `itemSetter` is called for each item when it changes.
- `helper` provides `getDiffs`, `getTemplate`, `getListItemIndex`, etc.
- Supports custom `itemCreator` for advanced templating.

---

## Global Options & Per‑Binding Options

All bindings accept an `options` object:

| Option                   | Type        | Default     | Description                                                                        |
| ------------------------ | ----------- | ----------- | ---------------------------------------------------------------------------------- |
| `debounceTime`           | number      | `0`         | Debounce time (ms) for store subscription.                                         |
| `autoDisconnect`         | boolean     | `true`      | Automatically unbind when element is removed from DOM (checked via `isConnected`). |
| `signal`                 | AbortSignal | `undefined` | Unbind when signal is aborted.                                                     |
| `event` (two‑way)        | string      | depends     | Custom event name for DOM updates.                                                 |
| `lazy` (input)           | boolean     | `false`     | If `true`, listens to `change` instead of `input`.                                 |
| `invert` (class toggles) | boolean     | `false`     | If `true`, class is applied when value is `false`.                                 |
| `hideClassName` (show)   | string      | `'d-none'`  | CSS class used to hide the element.                                                |

You can change defaults globally:

```js
import { globalOptions } from '@supercat1337/store2-dom';
globalOptions.debounceTime = 100;
globalOptions.autoDisconnect = false;
```

---

## ⚠️ Important Notes / Known Limitations

- **Nested mutations are not tracked** – always use immutable updates or `makeAutoObservable` (see [store2 docs](https://github.com/supercat1337/store2#working-with-deep-objects)).
- **Destructuring a reactive value breaks tracking** – always use `reactive.value` directly inside bindings.
- **`autoDisconnect` checks `element.isConnected` on each update** – if the element is removed but the reactive value never changes again, cleanup will only happen on the next update. For guaranteed cleanup, use `signal` or call the returned unsubscribe function.
- **Two‑way bindings may cause loops** – ensure your reactive logic doesn't update the same atom in response to its own change.
- **`bindToList` performs a full rerender on collection replacement** – if you replace the entire `collection.value` with a new array, it will rebuild the list. Use mutation methods (`push`, `setItem`, etc.) for incremental updates.

---

## Integration with Frameworks

### React

```jsx
import { atom } from '@supercat1337/store2';
import { bindToInput } from '@supercat1337/store2-dom';
import { useEffect, useRef } from 'react';

// Create atom outside component to avoid recreation on each render
const nameAtom = atom('React');

function NameInput() {
    const inputRef = useRef(null);

    useEffect(() => {
        const unsub = bindToInput(inputRef.current, nameAtom);
        return unsub;
    }, []);

    return <input ref={inputRef} />;
}
```

Alternatively, if you need the atom to be instance‑specific, use `useRef` with lazy initialization:

```jsx
function NameInput() {
    const inputRef = useRef(null);
    const nameRef = useRef(null);

    if (!nameRef.current) {
        nameRef.current = atom('React');
    }

    useEffect(() => {
        const unsub = bindToInput(inputRef.current, nameRef.current);
        return unsub;
    }, []);

    return <input ref={inputRef} />;
}
```

### Vue (Composition API)

```vue
<template>
    <input ref="inputRef" />
</template>

<script setup>
import { atom } from '@supercat1337/store2';
import { bindToInput } from '@supercat1337/store2-dom';
import { ref, onMounted, onUnmounted } from 'vue';

const name = atom('Vue');
const inputRef = ref(null);
let unsubscribe;

onMounted(() => {
    unsubscribe = bindToInput(inputRef.value, name);
});
onUnmounted(() => unsubscribe?.());
</script>
```

For better integration, consider using the `signal` option with an `AbortController`.

---

## Utilities

- `getDiffs(newObj, oldObj, compareFn?)` – returns an object with `true` for changed/added properties.
- `globalOptions` – mutate global defaults.

---

## TypeScript

The package ships with its own `.d.ts` files. Import types if needed:

```typescript
import type {
    BinderOptions,
    ListItemHelper,
    ListItemSetterDetails,
} from '@supercat1337/store2-dom';
```

---

## License

MIT © 2025–2026 Albert Bazaleev
