// @ts-check
import { globalOptions } from '../../globalOptions.js';
import { attachAbortSignal } from '../../utils/abort-helper.js';

/**
 * Two-way binding for a multiple-select element with a Collection of strings.
 * @param {HTMLSelectElement} selectElement - The multiple select element.
 * @param {import("@supercat1337/store2").Collection<string>} reactive - The reactive collection.
 * @param {import("../../types.d.ts").BinderOptions & { event?: string }} [options={}] - Options.
 * @returns {()=>void}
 */
export function bindToSelectMultiple(selectElement, reactive, options = {}) {
    const _options = Object.assign({}, globalOptions, { event: 'change' }, options);
    const { debounceTime, autoDisconnect, event: eventName, signal } = _options;

    function updateSelectedOptions() {
        const selectedValues = reactive.value;
        const options = selectElement.options;
        for (let i = 0; i < options.length; i++) {
            options[i].selected = selectedValues.indexOf(options[i].value) !== -1;
        }
    }

    const changeHandler = () => {
        const selected = [];
        for (let i = 0; i < selectElement.options.length; i++) {
            if (selectElement.options[i].selected) selected.push(selectElement.options[i].value);
        }
        reactive.value = selected;
    };

    // Initial sync
    updateSelectedOptions();

    selectElement.addEventListener(eventName, changeHandler);

    const storeUnsubscribe = reactive.subscribe(
        () => {
            if (autoDisconnect && !selectElement.isConnected) {
                cleanup();
                return;
            }
            updateSelectedOptions();
        },
        { delay: debounceTime }
    );

    function cleanup() {
        selectElement.removeEventListener(eventName, changeHandler);
        storeUnsubscribe();
    }

    const removeAbortListener = attachAbortSignal(signal, cleanup);
    return () => {
        cleanup();
        removeAbortListener();
    };
}
