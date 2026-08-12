// @ts-check
import { globalOptions } from './../../globalOptions.js';
import { attachAbortSignal } from '../../utils/abort-helper.js';
import { Atom } from '@supercat1337/store2';

/**
 * Two-way binding for a single-select element with a string Atom.
 * @param {HTMLSelectElement} selectElement - The select element.
 * @param {import("@supercat1337/store2").Atom<string>} reactive - The reactive atom.
 * @param {import("../../types.d.ts").BinderOptions & { event?: string }} [options={}] - Options (event, debounceTime, autoDisconnect, signal).
 * @returns {()=>void}
 */
export function bindToSelect(selectElement, reactive, options = {}) {
    if (!(reactive instanceof Atom)) {
        throw new TypeError('bindToSelect expects an Atom<string>');
    }

    const _options = Object.assign({}, globalOptions, { event: 'change' }, options);
    const { debounceTime, autoDisconnect, event: eventName, signal } = _options;

    /** @param {string} value  */
    function setter(value) {
        selectElement.value = value;
    }

    setter(reactive.value);

    const callback = () => {
        reactive.value = selectElement.value;
    };

    selectElement.addEventListener(eventName, callback);

    const storeUnsubscribe = reactive.subscribe(
        _details => {
            if (autoDisconnect && !selectElement.isConnected) {
                cleanup();
                return;
            }
            setter(reactive.value);
        },
        { delay: debounceTime }
    );

    function cleanup() {
        selectElement.removeEventListener(eventName, callback);
        storeUnsubscribe();
    }

    const removeAbortListener = attachAbortSignal(signal, cleanup);

    return () => {
        cleanup();
        removeAbortListener();
    };
}
