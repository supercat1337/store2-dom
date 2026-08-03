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
} from '@supercat1337/store2-dom';

// ---- Input (text) ----
const inputAtom = atom('initial');
const inputEl = document.getElementById('input-text');
if (inputEl) bindToInput(inputEl, inputAtom);
const inputDisplay = document.getElementById('input-text-display');
if (inputDisplay) bindToText(inputDisplay, inputAtom);

// ---- Checkbox ----
const checkboxAtom = atom(false);
const checkboxEl = document.getElementById('checkbox-demo');
if (checkboxEl) bindToCheckbox(checkboxEl, checkboxAtom);
const checkboxDisplay = document.getElementById('checkbox-display');
if (checkboxDisplay) bindToText(checkboxDisplay, checkboxAtom);

// ---- Radio Group ----
const radioAtom = atom('A');
const radioEls = document.querySelectorAll('input[name="radio-group"]');
if (radioEls.length) bindToRadioGroup([...radioEls], radioAtom);
const radioDisplay = document.getElementById('radio-display');
if (radioDisplay) bindToText(radioDisplay, radioAtom);

// ---- Select (single) ----
const selectAtom = atom('apple');
const selectEl = document.getElementById('select-demo');
if (selectEl) bindToSelect(selectEl, selectAtom);
const selectDisplay = document.getElementById('select-display');
if (selectDisplay) bindToText(selectDisplay, selectAtom);

// ---- Checkbox Group ----
const checkboxGroupAtom = collection(['red']);
const checkboxGroupEls = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
if (checkboxGroupEls.length) bindToCheckboxGroup([...checkboxGroupEls], checkboxGroupAtom);
const checkboxGroupDisplay = document.getElementById('checkbox-group-display');
if (checkboxGroupDisplay) {
    // bind to string representation
    const displayAtom = atom('');
    checkboxGroupAtom.subscribe(() => {
        runInAction(() => {
            displayAtom.value = JSON.stringify(checkboxGroupAtom.value);
        });
    });
    bindToText(checkboxGroupDisplay, displayAtom);
    // initial
    displayAtom.value = JSON.stringify(checkboxGroupAtom.value);
}

// ---- Select Multiple ----
const selectMultipleAtom = collection(['one', 'three']);
const selectMultipleEl = document.getElementById('select-multiple-demo');
if (selectMultipleEl) bindToSelectMultiple(selectMultipleEl, selectMultipleAtom);
const selectMultipleDisplay = document.getElementById('select-multiple-display');
if (selectMultipleDisplay) {
    const displayAtom2 = atom('');
    selectMultipleAtom.subscribe(() => {
        runInAction(() => {
            displayAtom2.value = JSON.stringify(selectMultipleAtom.value);
        });
    });
    bindToText(selectMultipleDisplay, displayAtom2);
    displayAtom2.value = JSON.stringify(selectMultipleAtom.value);
}
