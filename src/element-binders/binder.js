// @ts-check

import { globalOptions } from './../globalOptions.js';
import { attachAbortSignal } from '../utils/abort-helper.js';

// binder is intended for one-way bindings that do not attach DOM event listeners.
// For two-way bindings, implement custom cleanup logic directly.

/**
 * Binds a reactive item to an element using a custom setter function.
 * @template T
 * @template {object} C
 * @param {HTMLElement} element - The DOM element.
 * @param {import("@supercat1337/store2").Atom<T> | import("@supercat1337/store2").Computed<T>} reactiveItem - The reactive item.
 * @param {(reactiveItem: import("@supercat1337/store2").Atom<T> | import("@supercat1337/store2").Computed<T>, element: HTMLElement, ctx: C, options: import("../types.d.ts").BinderOptions) => void} setter - Function that updates the element.
 * @param {C} [ctx] - Optional context object passed to setter.
 * @param {import("../types.d.ts").BinderOptions} [options={}] - Options (debounceTime, autoDisconnect, signal).
 * @returns {()=>void}
 */
export function binder(element, reactiveItem, setter, ctx = /** @type {C} */ ({}), options = {}) {
    const _options = Object.assign({}, globalOptions, options);
    const { debounceTime, autoDisconnect, signal } = _options;

    setter(reactiveItem, element, ctx, _options);

    const unsubscribe = reactiveItem.subscribe(_details => {
        if (autoDisconnect && !element.isConnected) {
            unsubscribe();
            return;
        }
        setter(reactiveItem, element, ctx, _options);
    }, {delay: debounceTime});

    // Attach abort signal if provided
    const removeAbortListener = attachAbortSignal(signal, unsubscribe);

    // Return a combined unsubscribe function
    return () => {
        unsubscribe();
        removeAbortListener();
    };
}
