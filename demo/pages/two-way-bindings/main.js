// @ts-check

import { atom, collection, runInAction } from '@supercat1337/store2';
import {
    bindToInput,
    bindToCheckbox,
    bindToRadioGroup,
    bindToSelect,
    bindToCheckboxGroup,
    bindToSelectMultiple,
    bindToText,
    getElement,
} from '@supercat1337/store2-dom';

// ==========================================
// 1. Text Input (two-way)
// ==========================================
const inputAtom = atom('initial');
const inputEl = getElement('#input-text', HTMLInputElement);
bindToInput(inputEl, inputAtom);

const inputDisplay = getElement('#input-text-display', HTMLSpanElement);
bindToText(inputDisplay, inputAtom);

// ==========================================
// 2. Checkbox (two-way)
// ==========================================
const checkboxAtom = atom(false);
const checkboxEl = getElement('#checkbox-demo', HTMLInputElement);
bindToCheckbox(checkboxEl, checkboxAtom);

const checkboxDisplay = getElement('#checkbox-display', HTMLSpanElement);
bindToText(checkboxDisplay, checkboxAtom);

// ==========================================
// 3. Radio Group (two-way)
// ==========================================
const radioAtom = atom('A');
const radioEls = /** @type {NodeListOf<HTMLInputElement>} */ (
    document.querySelectorAll('input[name="radio-group"]')
);
if (radioEls.length === 0) {
    throw new Error('No radio buttons found with name="radio-group"');
}
bindToRadioGroup([...radioEls], radioAtom);

const radioDisplay = getElement('#radio-display', HTMLSpanElement);
bindToText(radioDisplay, radioAtom);

// ==========================================
// 4. Single Select (two-way)
// ==========================================
const selectAtom = atom('apple');
const selectEl = getElement('#select-demo', HTMLSelectElement);
bindToSelect(selectEl, selectAtom);

const selectDisplay = getElement('#select-display', HTMLSpanElement);
bindToText(selectDisplay, selectAtom);

// ==========================================
// 5. Checkbox Group (multiple checkboxes)
// ==========================================
const checkboxGroupAtom = collection(['red']);
const checkboxGroupEls = /** @type {NodeListOf<HTMLInputElement>} */ (
    document.querySelectorAll('.checkbox-group input[type="checkbox"]')
);
if (checkboxGroupEls.length === 0) {
    throw new Error('No checkboxes found in .checkbox-group');
}
bindToCheckboxGroup([...checkboxGroupEls], checkboxGroupAtom);

const checkboxGroupDisplay = getElement('#checkbox-group-display', HTMLSpanElement);
// Bind a derived atom that JSON-stringifies the collection value
const displayGroupAtom = atom(JSON.stringify(checkboxGroupAtom.value));
bindToText(checkboxGroupDisplay, displayGroupAtom);

checkboxGroupAtom.subscribe(() => {
    runInAction(() => {
        displayGroupAtom.value = JSON.stringify(checkboxGroupAtom.value);
    });
});

// ==========================================
// 6. Multiple Select (two-way)
// ==========================================
const selectMultipleAtom = collection(['one', 'three']);
const selectMultipleEl = getElement('#select-multiple-demo', HTMLSelectElement);
bindToSelectMultiple(selectMultipleEl, selectMultipleAtom);

const selectMultipleDisplay = getElement('#select-multiple-display', HTMLSpanElement);
const displayMultipleAtom = atom(JSON.stringify(selectMultipleAtom.value));
bindToText(selectMultipleDisplay, displayMultipleAtom);

selectMultipleAtom.subscribe(() => {
    runInAction(() => {
        displayMultipleAtom.value = JSON.stringify(selectMultipleAtom.value);
    });
});
