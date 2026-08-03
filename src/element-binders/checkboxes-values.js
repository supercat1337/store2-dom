// @ts-check
import { globalOptions } from '../globalOptions.js';
import { attachAbortSignal } from '../utils/abort-helper.js';

/**
 * Two-way binding between a collection of strings and a set of checkboxes with matching values.
 * @param {HTMLInputElement[]} checkboxes - Array of checkbox elements.
 * @param {import("@supercat1337/store2").Collection<string>} collection - The reactive collection.
 * @param {import("../types.d.ts").BinderOptions & { event?: string }} [options={}] - Options.
 * @returns {()=>void}
 */
export function bindToCheckboxGroup(checkboxes, collection, options = {}) {
    if (checkboxes.length === 0) return () => {};

    const _options = Object.assign({}, globalOptions, { event: 'change' }, options);
    const { debounceTime, autoDisconnect, event: eventName, signal } = _options;

    function updateCheckboxes() {
        const selectedValues = collection.value;
        for (let i = 0; i < checkboxes.length; i++) {
            checkboxes[i].checked = selectedValues.indexOf(checkboxes[i].value) !== -1;
        }
    }

    const changeHandler = () => {
        const selected = [];
        for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) selected.push(checkboxes[i].value);
        }
        collection.value = selected;
    };

    // Initial sync
    updateCheckboxes();

    const storeUnsubscribe = collection.subscribe(
        () => {
            if (autoDisconnect && !checkboxes[0]?.isConnected) {
                cleanup();
                return;
            }
            updateCheckboxes();
        },
        { delay: debounceTime }
    );

    for (const cb of checkboxes) {
        cb.addEventListener(eventName, changeHandler);
    }

    function cleanup() {
        for (const cb of checkboxes) {
            cb.removeEventListener(eventName, changeHandler);
        }
        storeUnsubscribe();
    }

    const removeAbortListener = attachAbortSignal(signal, cleanup);
    return () => {
        cleanup();
        removeAbortListener();
    };
}
