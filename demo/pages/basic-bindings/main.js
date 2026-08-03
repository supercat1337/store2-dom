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
} from '@supercat1337/store2-dom';

/** @type {HTMLSpanElement} */
const textEl = /** @type {any} */ (document.getElementById('text-demo'));
/** @type {HTMLDivElement} */
const htmlEl = /** @type {any} */ (document.getElementById('html-demo'));
/** @type {HTMLDivElement} */
const classEl = /** @type {any} */ (document.getElementById('class-demo'));
/** @type {HTMLDivElement} */
const styleEl = /** @type {any} */ (document.getElementById('style-demo'));
/** @type {HTMLDivElement} */
const showEl = /** @type {any} */ (document.getElementById('show-demo'));
/** @type {HTMLDivElement} */
const attrEl = /** @type {any} */ (document.getElementById('attr-demo'));
/** @type {HTMLSpanElement} */
const attrStatusSpan = /** @type {any} */ (document.getElementById('attr-status-value'));
/** @type {HTMLDivElement} */
const datasetEl = /** @type {any} */ (document.getElementById('dataset-demo'));
/** @type {HTMLSpanElement} */
const datasetRoleSpan = /** @type {any} */ (document.getElementById('dataset-role'));
/** @type {HTMLSpanElement} */
const datasetStatusSpan = /** @type {any} */ (document.getElementById('dataset-status'));

// ==========================================
// 1. Text Binding
// ==========================================
const textAtom = atom('Hello, world!');
bindToText(textEl, textAtom);
document.getElementById('text-update')?.addEventListener('click', () => {
    textAtom.value = `Updated at ${new Date().toLocaleTimeString()}`;
});

// ==========================================
// 2. HTML Binding
// ==========================================
const htmlAtom = atom('<strong>Initial HTML</strong>');
bindToHtml(htmlEl, htmlAtom);
document.getElementById('html-update')?.addEventListener('click', () => {
    htmlAtom.value = `<em>New HTML content</em> with <span style="color:red;">color</span>`;
});

// ==========================================
// 3. Class Binding (bindToCssClass)
// ==========================================
const highlightAtom = atom(false);
bindToCssClass(classEl, highlightAtom, 'highlight');
document.getElementById('class-toggle')?.addEventListener('click', () => {
    highlightAtom.value = !highlightAtom.value;
    document.getElementById('class-toggle').textContent = highlightAtom.value
        ? 'Remove Highlight'
        : 'Toggle Highlight';
});

// ==========================================
// 4. Style Binding
// ==========================================
const styleAtom = atom({ backgroundColor: 'lightblue', padding: '10px' });
bindToStyle(styleEl, styleAtom);
document.getElementById('style-update')?.addEventListener('click', () => {
    styleAtom.value = { backgroundColor: 'lightgreen', padding: '20px', fontWeight: 'bold' };
});

// ==========================================
// 5. Show Binding
// ==========================================
const showAtom = atom(true);
bindToShow(showEl, showAtom);
document.getElementById('show-toggle')?.addEventListener('click', () => {
    showAtom.value = !showAtom.value;
    document.getElementById('show-toggle').textContent = showAtom.value ? 'Hide Box' : 'Show Box';
});

// ==========================================
// 6. Attribute Binding 
// ==========================================
const statusAtom = atom('inactive');
bindToAttribute(attrEl, statusAtom, 'data-status');
// Также свяжем текст, показывающий текущее значение
bindToText(attrStatusSpan, statusAtom);

document.getElementById('attr-update')?.addEventListener('click', () => {
    statusAtom.value = statusAtom.value === 'active' ? 'inactive' : 'active';
});

// ==========================================
// 7. Dataset Binding 
// ==========================================
const datasetAtom = atom({
    role: 'user',
    status: 'online',
});
bindToDataset(datasetEl, datasetAtom);

// Обновляем текстовые отображения
// Для простоты используем bindToText для каждого поля
// Но так как datasetAtom – это объект, мы создадим отдельные атомы для отображения.
// Можно использовать computed или просто обновлять вручную.
const roleDisplayAtom = atom(datasetAtom.value.role);
const statusDisplayAtom = atom(datasetAtom.value.status);
bindToText(datasetRoleSpan, roleDisplayAtom);
bindToText(datasetStatusSpan, statusDisplayAtom);

// Следим за изменениями datasetAtom и обновляем display-атомы
datasetAtom.subscribe(() => {
    const data = datasetAtom.value;
    runInAction(() => {
        roleDisplayAtom.value = data.role || 'undefined';
        statusDisplayAtom.value = data.status || 'undefined';
    });
});

document.getElementById('dataset-update')?.addEventListener('click', () => {
    datasetAtom.value = {
        role: 'admin',
        status: 'online',
    };
});

document.getElementById('dataset-reset')?.addEventListener('click', () => {
    datasetAtom.value = {
        role: 'user',
        status: 'offline',
    };
});
