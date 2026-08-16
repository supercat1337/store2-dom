# @supercat1337/store2-dom

**DOM binding utilities for reactive stores** — seamlessly connect `@supercat1337/store2` to the DOM.

[![npm version](https://badge.fury.io/js/%40supercat1337%2Fstore2-dom.svg)](https://www.npmjs.com/package/@supercat1337/store2-dom)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@supercat1337/store2-dom)](https://bundlephobia.com/package/@supercat1337/store2-dom)

> 📘 For detailed technical documentation, see [AGENTS.md](./AGENTS.md).

---

## Why store2-dom?

- **Declarative DOM bindings** – no more manual `addEventListener` and `textContent` updates.
- **Automatic cleanup** – bindings unsubscribe when elements are removed from the DOM (`autoDisconnect: true` by default) using a lightweight `isConnected` check.
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

document.getElementById('reset-btn').addEventListener('click', () => {
    name.value = 'World';
});
```

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

> ⚠️ **Important:** Two-way bindings expect an `Atom` for single values and a `Collection` for multiple values. Passing a `Computed` will throw a `TypeError`.

---

## List Binding (`bindToList`)

Efficiently render a reactive array into a container.

```js
import { collection } from '@supercat1337/store2';
import { bindToList } from '@supercat1337/store2-dom';

const todos = collection([{ id: 1, text: 'Learn store2' }]);

// Template defined in HTML
const template = document.getElementById('todo-item-template');

bindToList(
    document.getElementById('todo-list'),
    todos,
    // onUpdateItem – called on creation and every update
    (helper, { itemElement, value, oldValue }) => {
        const span = itemElement.querySelector('span');
        const diffs = helper.getDiffs(value, oldValue);
        if (diffs.text) span.textContent = value.text;
    },
    {
        template, // HTMLElement or <template> element
        getKey: 'id', // optional, enables key-based reconciliation
        onRemoveItem: (el, value, index) => {
            console.log(`Removing ${value.text} at ${index}`);
        },
    }
);
```

**Signature:**  
`bindToList(container, reactiveItem, onUpdateItem, options?)`

**Options:**

| Option           | Type                                             | Description                                                                                    |
| ---------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `template`       | `HTMLElement \| HTMLTemplateElement`             | Explicit template (cloned for each item). Required if `createItem` is not provided.            |
| `createItem`     | `(helper: ListItemHelper) => HTMLElement`        | Custom element factory. Required if `template` is not provided.                                |
| `getKey`         | `string \| ((value, index) => string \| number)` | Generates a stable key for each item (stored as `data-key`). Enables key-based reconciliation. |
| `onRemoveItem`   | `(itemElement, value, index) => void`            | Called before an item is removed. Useful for cleanup.                                          |
| `debounceTime`   | `number`                                         | Debounce time (ms) for store subscription.                                                     |
| `autoDisconnect` | `boolean`                                        | Auto‑unbind when container is removed from DOM.                                                |
| `signal`         | `AbortSignal`                                    | Unbind when signal aborts.                                                                     |

**`ListItemHelper` methods:**

| Method                            | Description                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------- |
| `getListItemIndex(element)`       | Returns the index of the item element (from `item-index` attribute).         |
| `getListItem(element, attrName?)` | Finds the parent list item (by `item-index` or custom attribute).            |
| `getKey(element)`                 | Returns the key from `data-key` attribute (as string or `undefined`).        |
| `getListItemByKey(key)`           | Finds the item element by its key.                                           |
| `findIndex(array, key)`           | Finds the index of an item in the array by its key (uses `getKey` function). |
| `getDiffs(newObj, oldObj, cmp?)`  | Returns an object with `true` for changed properties.                        |

---

## Global Options & Per‑Binding Options

All bindings accept an `options` object:

| Option                   | Type        | Default     | Description                                            |
| ------------------------ | ----------- | ----------- | ------------------------------------------------------ |
| `debounceTime`           | number      | `0`         | Debounce time (ms) for store subscription.             |
| `autoDisconnect`         | boolean     | `true`      | Automatically unbind when element is removed from DOM. |
| `signal`                 | AbortSignal | `undefined` | Unbind when signal is aborted.                         |
| `event` (two‑way)        | string      | depends     | Custom event name for DOM updates.                     |
| `lazy` (input)           | boolean     | `false`     | If `true`, listens to `change` instead of `input`.     |
| `invert` (class toggles) | boolean     | `false`     | If `true`, class is applied when value is `false`.     |
| `hideClassName` (show)   | string      | `'d-none'`  | CSS class used to hide the element.                    |

You can change defaults globally:

```js
import { globalOptions } from '@supercat1337/store2-dom';
globalOptions.debounceTime = 100;
globalOptions.autoDisconnect = false;
```

---

## Integration with `deepReactive` (from `@supercat1337/store2-deep`)

```js
import { deepReactive } from '@supercat1337/store2-deep';
import { bindToProperty } from '@supercat1337/store2-dom';
import { computed } from '@supercat1337/store2';

const state = deepReactive({ user: { name: 'Alice' } });
const nameComputed = computed(() => state.user.name);

const input = document.getElementById('name');
bindToProperty(input, nameComputed, 'value'); // read‑only
input.addEventListener('input', () => {
    state.user.name = input.value; // write back
});
```

> Use `bindToProperty` (not `bindToInput`) for computed values.

---

## ⚠️ Important Notes / Known Limitations

- **Nested mutations are not tracked** – use immutable updates or `deepReactive`.
- **Destructuring a reactive value breaks tracking** – always use `reactive.value` directly.
- **`autoDisconnect` checks `element.isConnected` on each update** – cleanup happens on next update after removal.
- **`bindToList` requires either `template` or `createItem`** – no implicit fallback.
- **Full array replacement in `bindToList` triggers a rebuild** – use mutation methods for incremental updates.

---

## Integration with Frameworks

### React

```jsx
import { atom } from '@supercat1337/store2';
import { bindToInput } from '@supercat1337/store2-dom';
import { useEffect, useRef } from 'react';

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

---

## Utilities

- `getDiffs(newObject, oldObject, customCompare?)` – diff helper.
- `getElement(selector, type?, root?)` – find element or throw.
- `getElementById(id, type?, root?)` – find by ID or throw.
- `globalOptions` – global defaults object.

---

## TypeScript

```typescript
import type {
    BinderOptions,
    ListItemHelper,
    ListItemUpdateContext,
} from '@supercat1337/store2-dom';
```

---

## License

MIT © 2025–2026 Albert Bazaleev
