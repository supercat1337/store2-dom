# AI Documentation: @supercat1337/store2-dom

**DOM binding utilities for `@supercat1337/store2`**  
~13 KB (core) + utilities, depends on `@supercat1337/store2`, auto‑cleanup, custom events, full TypeScript support via JSDoc.

---

## Table of Contents

1. [Installation & Import](#installation--import)
2. [Core Concepts](#core-concepts)
3. [One‑Way Bindings](#one-way-bindings)
4. [Two‑Way Bindings](#two-way-bindings)
5. [List Binding (`bindToList`)](#list-binding-bindtolist)
6. [Utilities & Helpers](#utilities--helpers)
7. [Global Options](#global-options)
8. [TypeScript](#typescript)
9. [Internal Mechanics & Implementation Details](#9-internal-mechanics--implementation-details)
    - [9.1. `autoDisconnect` Implementation](#91-autodisconnect-implementation)
    - [9.2. `bindToList` Internals](#92-bindtolist-internals)
10. [Working with `deepReactive`](#10-working-with-deepreactive-from-supercat1337store2-deep)
11. [Common Pitfalls for AI-Generated Code](#11-common-pitfalls-for-ai-generated-code)
12. [Examples](#12-examples)
13. [Working with Deep Objects](#13-working-with-deep-objects)
14. [License](#license)

---

## Installation & Import

```bash
npm install @supercat1337/store2-dom
```

```javascript
import { bindToInput, bindToShow, ... } from '@supercat1337/store2-dom';
```

---

## Core Concepts

- **`Atom`** – reactive primitive value.
- **`Computed`** – derived reactive value.
- **`Collection`** – reactive array.
- **Bindings** – functions that connect reactive items to DOM elements.
- **`autoDisconnect`** – when `true` (default), the binding automatically unsubscribes when the target element is removed from DOM.

All bindings accept an optional `options` object with:

- `debounceTime?: number` (default `0`)
- `autoDisconnect?: boolean` (default `true`)
- `signal?: AbortSignal` – if provided, the binding will automatically unsubscribe when the signal is aborted. Useful for integration with component lifecycles (e.g., React `useEffect`, Vue `onUnmounted`).
- plus binding‑specific options.

---

## One‑Way Bindings

These bindings update the DOM when the reactive value changes, but not vice versa.

### `bindToAttribute(element, reactive, attributeName, options?)`

- `element: HTMLElement`
- `reactive: Atom<string|null> | Computed<string|null>`
- If value is `null`, attribute is removed.

### `bindToClassString(element, reactive, options?)`

- `element: HTMLElement`
- `reactive: Atom<string> | Computed<string>`
- Sets `element.className`.

### `bindToCssClass(element, reactive, className, options?)`

- `element: HTMLElement`
- `reactive: Atom<boolean> | Computed<boolean>`
- `className: string`
- Options: `invert?: boolean` (default `false`). When `invert: false`, class is added when `reactive.value === true`.

### `bindToDisabled(element, reactive, options?)`

- Works on `HTMLButtonElement | HTMLInputElement | HTMLSelectElement | ...`
- Sets `element.disabled`.

### `bindToHtml(element, reactive, options?)`

- Sets `element.innerHTML`.

### `bindToProperty(element, reactive, propertyName, options?)`

- Generic property binder.

### `bindToShow(element, reactive, options?)`

- Options: `hideClassName?: string` (default `'d-none'`), `invert?: boolean` (default `false`).
- When `invert: false`, the `hideClassName` is added when `reactive.value === false` (element hidden). Equivalent to `bindToCssClass(element, reactive, hideClassName, { invert: true })`.

### `bindToStyle(element, reactive, options?)`

- Accepts string (cssText) or object (style properties). On object update, clears all existing inline styles before applying new ones.

### `bindToDataset(element, reactive, options?)`

- Accepts object `{ key: value }`. Replaces all `data-*` attributes; removes attributes not present in the new object. Passing `null` removes all.

### `bindToText(element, reactive, options?)`

- Works on `HTMLElement` or `Text` node. Sets `textContent`.

---

## Two‑Way Bindings

These sync DOM events back to the reactive item.

### `bindToCheckbox(checkbox, reactive, options?)`

- `checkbox: HTMLInputElement` (type checkbox)
- `reactive: Atom<boolean>`
- Options: `event?: string` (default `'change'`).

### `bindToCheckboxGroup(checkboxes, collection, options?)`

- `checkboxes: HTMLInputElement[]` (all type checkbox)
- `reactive: Collection<string>`
- Options: `event?: string` (default `'change'`).  
  Updates collection when any checkbox is toggled; updates checkboxes when collection changes.

### `bindToInput(input, reactive, options?)`

- `input: HTMLInputElement | HTMLTextAreaElement`
- `reactive: Atom<string | number>`
- Options: `lazy?: boolean` (default `false`), `event?: string` (overrides `lazy`).  
  For `type="number"`, invalid inputs reset to `0`.

### `bindToRadioGroup(radios, reactive, options?)`

- `radios: HTMLInputElement[]` (all type radio, same `name`)
- `reactive: Atom<string>`
- Options: `event?: string` (default `'change'`).

### `bindToSelect(select, reactive, options?)`

- `select: HTMLSelectElement` (single‑select)
- `reactive: Atom<string>`
- Options: `event?: string` (default `'change'`).

### `bindToSelectMultiple(select, reactive, options?)`

- `select: HTMLSelectElement` (with `multiple` attribute)
- `reactive: Collection<string>`
- Options: `event?: string` (default `'change'`).

All two‑way bindings return an `Unsubscriber` function that removes event listeners and store subscriptions. They also respect `autoDisconnect`.

**Important:** All two-way bindings enforce that the reactive item is of the correct type:

- `bindToInput`, `bindToCheckbox`, `bindToRadioGroup`, `bindToSelect` require an `Atom`.
- `bindToCheckboxGroup`, `bindToSelectMultiple` require a `Collection`.
  If a `Computed` or other type is passed, a `TypeError` is thrown.

---

## List Binding (`bindToList`)

### `bindToList(container, reactiveItem, onUpdateItem, createItem?, options?)`

- `container: HTMLElement` – the element that will contain the list items.
- `reactiveItem: Collection<T> | Computed<T[]>` – reactive array (must have a `.value` property).
- `onUpdateItem: (helper: ListItemHelper, details: ListItemUpdateContext<T>) => void` – called for each item when it is created or updated. Use `helper.getDiffs()` to apply minimal DOM changes.
- `createItem?: (helper: ListItemHelper) => HTMLElement` – optional custom element factory. If not provided, the first child of `container` is cloned as a template.
- `options: { debounceTime?, autoDisconnect?, signal? }`

**How it works:**

- When the reactive array changes, `bindToList` updates the DOM minimally.
- For a single `set` event on an index, `onUpdateItem` is called with the new value and the existing DOM element.
- For `add`/`remove` operations (e.g., `push`, `pop`, `splice`), elements are inserted or removed and their `item-index` attributes are updated.
- Full array replacement (e.g., `collection.value = [...]`) triggers a complete rebuild.
- `createItem` is used to generate new DOM nodes when needed.

**Performance considerations:**

- Prefer mutation methods (`push`, `pop`, `splice`, index assignment) over full array reassignment to avoid full rebuilds.
- Use `helper.getDiffs()` inside `onUpdateItem` to update only changed properties.

---

## Utilities & Helpers

### `getDiffs(newObject, oldObject, customCompareFunction?)`

Returns an object with the same keys as `newObject`, value `true` if the property is new or changed.

### `getElement(selector, type?, root?)`

Finds the first element matching a CSS selector. Throws if not found.

- `selector: string` – CSS selector.
- `type?: new (...args: any[]) => T` – optional constructor for type checking.
- `root?: Document | Element` – root element to search within (default `document`).

```js
const input = getElement('#my-input', HTMLInputElement);
const span = getElement('.my-span', HTMLSpanElement, container);
```

### `getElementById(id, type?, root?)`

Same as `getElement`, but by ID.

```js
const div = getElementById('my-div', HTMLDivElement);
```

### `globalOptions`

Global defaults object that you can mutate:

```js
import { globalOptions } from '@supercat1337/store2-dom';
globalOptions.debounceTime = 100;
globalOptions.autoDisconnect = false;
```

---

## TypeScript

The package includes `types.d.ts` – no additional configuration needed. Use JSDoc in your own project or import types:

```typescript
import type {
    BinderOptions,
    ListItemHelper,
    ListItemUpdateContext,
} from '@supercat1337/store2-dom';
```

---

## 9. Internal Mechanics & Implementation Details

### 9.1. `autoDisconnect` Implementation

`autoDisconnect` uses a **simple, lightweight check** rather than a `MutationObserver`:

- When a binding is created, it stores a reference to the target DOM element.
- Every time the reactive value changes and the binding needs to update the DOM, it first checks `element.isConnected`.
- If the element is no longer connected to the DOM, the binding **automatically unsubscribes** from the reactive store and removes any attached event listeners.
- This check is performed synchronously during each update cycle, making it **fast** and **reliable** for most use cases.

**Why this approach?**

- No need for `MutationObserver` – avoids extra overhead and complexity.
- Works correctly even when elements are removed and re‑added (the binding will stay unsubscribed – it does **not** re‑attach automatically, which is intentional to prevent memory leaks).
- If you need more explicit control, you can always use the `signal` option with an `AbortController`.

> **Note:** Because the check runs only when the reactive value changes, if an element is removed from the DOM but the reactive value never changes, the binding will not be cleaned up until the next update. In practice, this is rarely an issue, but for guaranteed cleanup, you can call the returned `unsubscribe` function manually or use `signal`.

### 9.2. `bindToList` Internals

`bindToList` maintains an internal map of index → DOM element. When the collection changes, it reacts to specific mutation events:

- **`eventType === 'set'`** (value at a specific index changed):
    - Calls `onUpdateItem` with the updated value and the existing DOM element.
    - `helper.getDiffs(newValue, oldValue)` is typically used inside `onUpdateItem` to determine which DOM properties need updating.
    - DOM is **not** recreated, only mutated in place.

- **`eventType === 'add'`** (items inserted at a specific index):
    - Creates new DOM elements using `itemCreator` (or cloning the template from the first child).
    - Inserts them at the correct position in the container.
    - Updates the internal map and index references.

- **`eventType === 'remove'`** (items removed at a specific index):
    - Removes the corresponding DOM element from the container.
    - Cleans up any subscriptions related to that item (if the item itself is reactive, though not typical).
    - Updates the internal map and reindexes subsequent elements.

- **`eventType === 'replace'`** (the entire collection was reassigned with a new array):
    - Clears the entire container and rebuilds all items from scratch using the new array.
    - This is a full rerender and should be avoided for large lists when only small changes are needed.

**Performance considerations:**

- `bindToList` uses a **simple diff** strategy based on index and the `getDiffs` helper. It does not use a virtual DOM; instead, it relies on the developer's `onUpdateItem` to efficiently update DOM nodes.
- For large collections, prefer using collection mutation methods (`push`, `pop`, `splice`, `setItem`) over full array reassignment to avoid full rerenders.

---
## 10. Working with `deepReactive` (from `@supercat1337/store2-deep`)

When using `store2-dom` together with `deepReactive`, follow this pattern to avoid confusion:

- **Read‑only binding** (state → DOM): create a `computed` that reads the deep property, then bind it with `bindToProperty` or `bindToText`.
- **Write‑back** (DOM → state): use native DOM events and mutate the proxy directly.

```js
import { deepReactive } from '@supercat1337/store2-deep';
import { bindToProperty, bindToText } from '@supercat1337/store2-dom';
import { computed } from '@supercat1337/store2';

const state = deepReactive({ user: { name: 'Alex' } });
const nameComputed = computed(() => state.user.name);

// Display
const input = document.getElementById('name');
bindToProperty(input, nameComputed, 'value');

// Write back on input
input.addEventListener('input', () => {
    state.user.name = input.value;
});

// Display JSON
const pre = document.getElementById('preview');
const jsonComputed = computed(() => JSON.stringify(state, null, 2));
bindToText(pre, jsonComputed);
```

**Important:** `bindToInput` expects an `Atom` with a setter, not a `computed`. For `computed` (which is read‑only), you must use `bindToProperty` (or `bindToText`) and handle the reverse sync manually. This is intentional — it keeps the data flow explicit and avoids accidental writes.

**Why this works:**

- `deepReactive` creates an `Atom` for each property behind the scenes.
- `computed` tracks those atoms and recomputes when they change.
- `bindToProperty` subscribes to the computed and updates the DOM property.
- DOM events write directly to the proxy, which triggers the computed and updates all bindings.

This approach is recommended for all projects that use `deepReactive` with DOM bindings. It is clean, predictable, and avoids creating extra reactive items.

---


## 11. Common Pitfalls for AI-Generated Code

When generating code that uses `store2-dom`, avoid these frequent mistakes:

1. **Not storing the unsubscribe function**  
   ❌ `bindToInput(input, atom)` without saving the return value – leads to memory leaks in SPA transitions.  
   ✅ Always store the returned unsubscribe function and call it on component unmount, or use `signal` option.

2. **Using `.peekValue()` with bindings**  
   ❌ `bindToText(el, computed(() => atom.peekValue()))` – the binding will not update because `peekValue()` doesn't track dependencies.  
   ✅ Pass the reactive item directly: `bindToText(el, atom)` or `bindToText(el, computed(() => atom.value))`.

3. **Full array reassignment with `bindToList`**  
   ❌ `todos.value = [...todos.value, newTodo]` – triggers a full rerender of the list, which is expensive.  
   ✅ Use `todos.value.push(newTodo)` or `todos.value.setItem(index, newValue)` to apply minimal DOM updates.

4. **Assuming `autoDisconnect` works when moving elements**  
   ❌ Relying on `autoDisconnect` when you programmatically move an element to another container – the check `isConnected` will return `true` if it's still in the DOM, so `autoDisconnect` won't trigger. That's correct and intended.  
   ✅ Use `signal` with an `AbortController` and explicitly abort it when you want to detach the binding, or call the returned unsubscribe function manually.

5. **Mutating reactive value inside two-way binding event**  
   ❌ `atom.value = event.target.value` inside a `bindToInput` – the binding already does this; double‑updating can cause loops.  
   ✅ Let the binding handle the DOM → store sync; only mutate the atom from outside when needed.

6. **Destructuring `collection.value` inside `bindToList`**  
   ❌ `const items = collection.value` – breaks reactivity because the binding needs the reactive object itself.  
   ✅ Pass the `collection` directly to `bindToList`.

7. **Not using `getDiffs` to minimize DOM updates**  
   ❌ Updating all DOM properties on every `onUpdateItem` call, even when only one field changed.  
   ✅ Use `helper.getDiffs(newValue, oldValue)` to conditionally update only changed parts.

8. **Using `bindToHtml` with untrusted content**  
   ❌ `bindToHtml(el, userInputAtom)` – exposes your app to XSS attacks.  
   ✅ Use `bindToText` for user-generated content, or sanitize HTML before rendering.

By following these guidelines, AI-generated code will be efficient, safe, and correctly reactive.

---

## 12. Examples

### Counter with controls

```javascript
import { Store, atom } from '@supercat1337/store2';
import { bindToInput, bindToCheckbox, bindToCssClass, bindToShow } from '@supercat1337/store2-dom';

const store = new Store();
const count = atom(0);
const enabled = atom(true);
const visible = atom(true);
const danger = atom(false);

const input = document.querySelector('input');
bindToInput(input, count);

const enableCheck = document.querySelector('#enable');
bindToCheckbox(enableCheck, enabled);

const visibleCheck = document.querySelector('#visible');
bindToShow(document.querySelector('.counter'), visibleCheck);

const dangerCheck = document.querySelector('#danger');
bindToCssClass(document.querySelector('.value'), dangerCheck, 'text-danger');
```

### Todo list

```javascript
const todos = collection([]);
const container = document.querySelector('ul');

bindToList(
    container,
    todos,
    (helper, details) => {
        const li = details.itemElement;
        const span = li.querySelector('span');
        if (helper.getDiffs({ text: details.value }, { text: details.oldValue }).text) {
            span.textContent = details.value.text;
        }
    },
    null,
    { autoDisconnect: true }
);
```

### Using AbortSignal for automatic cleanup

All bindings support the `signal` option, which allows you to automatically unbind when an `AbortSignal` is aborted. This is especially useful in component frameworks.

```javascript
const controller = new AbortController();

const unsubscribe = bindToInput(inputElement, nameAtom, { signal: controller.signal });

// Later, when the component unmounts:
controller.abort(); // automatically cleans up the binding
```

---

## 13. Working with Deep Objects

`store2-dom` follows the **immutable update** pattern for deep objects. To update nested fields, always create a new object reference.

**Recommended approach (spread operator):**

```js
user.value = { ...user.value, profile: { ...user.value.profile, age: 26 } };
```

**Alternative: decompose state** into multiple atoms:

```js
const userName = atom('Alex');
const userAge = atom(25);
```

**Escape hatch:** if you must mutate, provide a custom `compareFunction` that performs deep equality (e.g., via `JSON.stringify`) and then trigger update with `value = value`.

See the main store2 README for detailed guidance.

> **For `deepReactive` users:** You do not need to follow the immutable update pattern — `deepReactive` allows direct mutations (`state.user.name = 'Bob'`). However, when binding to DOM, still use `computed` getters as shown above.

---

## 14. License

MIT
