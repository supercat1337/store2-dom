// @ts-check

import { atom, runInAction } from '@supercat1337/store2';
import {
    bindToText,
    bindToHtml,
    bindToCssClass,
    bindToStyle,
    bindToShow,
    bindToAttribute,
    bindToDataset,
    getElement,
} from '@supercat1337/store2-dom';

// ==========================================
// 1. Text Binding
// ==========================================
const textEl = getElement('#text-demo', HTMLSpanElement);
const textAtom = atom('Hello, world!');
bindToText(textEl, textAtom);

const textUpdateBtn = getElement('#text-update', HTMLButtonElement);
textUpdateBtn.addEventListener('click', () => {
    textAtom.value = `Updated at ${new Date().toLocaleTimeString()}`;
});

// ==========================================
// 2. HTML Binding
// ==========================================
const htmlEl = getElement('#html-demo', HTMLDivElement);
const htmlAtom = atom('<strong>Initial HTML</strong>');
bindToHtml(htmlEl, htmlAtom);

const htmlUpdateBtn = getElement('#html-update', HTMLButtonElement);
htmlUpdateBtn.addEventListener('click', () => {
    htmlAtom.value = `<em>New HTML content</em> with <span style="color:red;">color</span>`;
});

// ==========================================
// 3. Class Binding (bindToCssClass)
// ==========================================
const classEl = getElement('#class-demo', HTMLDivElement);
const classToggle = getElement('#class-toggle', HTMLButtonElement);
const highlightAtom = atom(false);
bindToCssClass(classEl, highlightAtom, 'highlight');

classToggle.addEventListener('click', () => {
    highlightAtom.value = !highlightAtom.value;
    classToggle.textContent = highlightAtom.value ? 'Remove Highlight' : 'Toggle Highlight';
});

// ==========================================
// 4. Style Binding
// ==========================================
const styleEl = getElement('#style-demo', HTMLDivElement);
const styleUpdate = getElement('#style-update', HTMLButtonElement);
const styleAtom = atom({ backgroundColor: 'lightblue', padding: '10px' });
bindToStyle(styleEl, styleAtom);

styleUpdate.addEventListener('click', () => {
    styleAtom.value = { backgroundColor: 'lightgreen', padding: '20px', fontWeight: 'bold' };
});

// ==========================================
// 5. Show Binding
// ==========================================
const showEl = getElement('#show-demo', HTMLDivElement);
const showToggle = getElement('#show-toggle', HTMLButtonElement);
const showAtom = atom(true);
bindToShow(showEl, showAtom);

showToggle.addEventListener('click', () => {
    showAtom.value = !showAtom.value;
    showToggle.textContent = showAtom.value ? 'Hide Box' : 'Show Box';
});

// ==========================================
// 6. Attribute Binding
// ==========================================
const attrEl = getElement('#attr-demo', HTMLDivElement);
const attrStatusSpan = getElement('#attr-status-value', HTMLSpanElement);
const statusAtom = atom('inactive');

bindToAttribute(attrEl, statusAtom, 'data-status');
bindToText(attrStatusSpan, statusAtom);

const attrUpdateBtn = getElement('#attr-update', HTMLButtonElement);
attrUpdateBtn.addEventListener('click', () => {
    statusAtom.value = statusAtom.value === 'active' ? 'inactive' : 'active';
});

// ==========================================
// 7. Dataset Binding
// ==========================================
const datasetEl = getElement('#dataset-demo', HTMLDivElement);
const datasetRoleSpan = getElement('#dataset-role', HTMLSpanElement);
const datasetStatusSpan = getElement('#dataset-status', HTMLSpanElement);

const datasetAtom = atom({
    role: 'user',
    status: 'online',
});
bindToDataset(datasetEl, datasetAtom);

// We'll use separate atoms to display the individual fields.
// Alternatively, we could use computed values, but here we manually sync.
const roleDisplayAtom = atom(datasetAtom.value.role);
const statusDisplayAtom = atom(datasetAtom.value.status);
bindToText(datasetRoleSpan, roleDisplayAtom);
bindToText(datasetStatusSpan, statusDisplayAtom);

// Watch for changes to the datasetAtom and update the display atoms
datasetAtom.subscribe(() => {
    const data = datasetAtom.value;
    runInAction(() => {
        roleDisplayAtom.value = data.role || 'undefined';
        statusDisplayAtom.value = data.status || 'undefined';
    });
});

const datasetUpdateBtn = getElement('#dataset-update', HTMLButtonElement);
datasetUpdateBtn.addEventListener('click', () => {
    datasetAtom.value = {
        role: 'admin',
        status: 'online',
    };
});

const datasetResetBtn = getElement('#dataset-reset', HTMLButtonElement);
datasetResetBtn.addEventListener('click', () => {
    datasetAtom.value = {
        role: 'user',
        status: 'offline',
    };
});
