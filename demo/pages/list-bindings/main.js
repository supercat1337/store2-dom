// @ts-check

import { collection, atom, batch } from '@supercat1337/store2';
import {
    bindToList,
    bindToText,
    bindToCheckbox,
    bindToCssClass,
    getDiffs,
    ListItemHelper,
    ListItemSetterDetails,
} from '@supercat1337/store2-dom';

// ============================================================
// 1. Простой список с шаблоном
// ============================================================

/** @type {HTMLUListElement} */
const simpleListEl = /** @type {any} */ (document.getElementById('simple-list'));
/** @type {HTMLSpanElement} */
const simpleCountEl = /** @type {any} */ (document.getElementById('simple-count'));

const simpleItems = collection(['Apple', 'Banana', 'Cherry']);
console.log(simpleItems.value);
console.log(Array.isArray(simpleItems.value));
// Счётчик
simpleItems.subscribe(() => {
    simpleCountEl.innerText = `${simpleItems.value.length} items`;
});

// Привязка списка
bindToList(
    simpleListEl,
    simpleItems,
    (helper, details) => {
        const textSpan = details.itemElement.querySelector('.item-text');
        if (textSpan) {
            textSpan.innerText = details.value;
        }

        let indexSpan = details.itemElement.querySelector('.item-index');
        if (!indexSpan) {
            indexSpan = document.createElement('span');
            indexSpan.className = 'item-index';
            details.itemElement.prepend(indexSpan);
        }
        indexSpan.innerText = String(details.index + 1);
    },
    null,
    { debounceTime: 0 }
);

// Обработчики кнопок – с защитой
document.getElementById('add-item-btn')?.addEventListener('click', () => {
    console.log(simpleItems.value);
    const current = simpleItems.value;
    simpleItems.value = [...current, `Item ${current.length + 1}`];
});

document.getElementById('remove-last-btn')?.addEventListener('click', () => {
    const current = Array.isArray(simpleItems.value) ? simpleItems.value : [];
    if (current.length > 0) {
        simpleItems.value = current.slice(0, -1);
    }
});

document.getElementById('reset-list-btn')?.addEventListener('click', () => {
    simpleItems.value = ['Apple', 'Banana', 'Cherry'];
});

// ============================================================
// 2. Кастомный creator (без шаблона)
// ============================================================

/** @type {HTMLDivElement} */
const customListEl = /** @type {any} */ (document.getElementById('custom-list'));

const customItems = collection(['First', 'Second', 'Third']);

/**
 * @param {ListItemHelper} helper
 * @returns {HTMLElement}
 */
function customCreator(helper) {
    const div = document.createElement('div');
    div.className = 'custom-item';

    const textSpan = document.createElement('span');
    textSpan.className = 'custom-text';
    div.appendChild(textSpan);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'custom-delete';
    deleteBtn.textContent = '✕';
    div.appendChild(deleteBtn);

    return div;
}

/**
 * @param {ListItemHelper} helper
 * @param {ListItemSetterDetails<string>} details
 */
function customSetter(helper, details) {
    const div = details.itemElement;
    const textSpan = div.querySelector('.custom-text');
    if (textSpan) {
        bindToText(textSpan, atom(details.value));
    }

    const deleteBtn = div.querySelector('.custom-delete');
    if (deleteBtn) {
        const newBtn = deleteBtn.cloneNode(true);
        deleteBtn.parentNode?.replaceChild(newBtn, deleteBtn);
        newBtn.addEventListener('click', () => {
            const current = Array.isArray(customItems.value) ? customItems.value : [];
            const index = details.index;
            if (index >= 0 && index < current.length) {
                const newArray = [...current];
                newArray.splice(index, 1);
                customItems.value = newArray;
            }
        });
    }
}

bindToList(customListEl, customItems, customSetter, customCreator, { debounceTime: 0 });

document.getElementById('add-custom-btn')?.addEventListener('click', () => {
    const current = Array.isArray(customItems.value) ? customItems.value : [];
    customItems.value = [...current, `Custom ${Date.now()}`];
});

document.getElementById('remove-last-custom-btn')?.addEventListener('click', () => {
    const current = Array.isArray(customItems.value) ? customItems.value : [];
    if (current.length > 0) {
        customItems.value = current.slice(0, -1);
    }
});

// ============================================================
// 3. Объектный список с getDiffs
// ============================================================

/** @type {HTMLUListElement} */
const objectListEl = /** @type {any} */ (document.getElementById('object-list'));

/** @typedef {Object} TodoItem @property {number} id @property {string} name @property {boolean} done */

/** @type {import('@supercat1337/store2').Collection<TodoItem>} */
const objectItems = collection([
    { id: 1, name: 'Learn store2', done: false },
    { id: 2, name: 'Build demo', done: true },
    { id: 3, name: 'Write tests', done: false },
]);

/**
 * @param {ListItemHelper} helper
 * @param {ListItemSetterDetails<TodoItem>} details
 */
function objectSetter(helper, details) {
    const li = details.itemElement;
    const checkbox = /** @type {HTMLInputElement} */ (li.querySelector('.obj-done'));
    const nameSpan = /** @type {HTMLSpanElement} */ (li.querySelector('.obj-name'));
    const idSpan = /** @type {HTMLSpanElement} */ (li.querySelector('.obj-id'));
    const deleteBtn = /** @type {HTMLButtonElement} */ (li.querySelector('.obj-delete'));

    const diffs = getDiffs(details.value, details.oldValue || {});

    if (diffs.name) {
        bindToText(nameSpan, atom(details.value.name));
    }
    if (diffs.done) {
        checkbox.checked = details.value.done;
        const doneAtom = atom(details.value.done);
        bindToCssClass(li, doneAtom, 'done');
    }
    if (diffs.id) {
        bindToText(idSpan, atom(String(details.value.id)));
    }

    // Обработчик изменения чекбокса
    const newCheckbox = checkbox.cloneNode(true);
    checkbox.parentNode?.replaceChild(newCheckbox, checkbox);
    newCheckbox.addEventListener('change', () => {
        const current = Array.isArray(objectItems.value) ? objectItems.value : [];
        const index = details.index;
        if (index >= 0 && index < current.length) {
            const newObj = { ...current[index], done: newCheckbox.checked };
            const newArray = [...current];
            newArray[index] = newObj;
            objectItems.value = newArray;
        }
    });

    // Обработчик удаления
    const newDeleteBtn = deleteBtn.cloneNode(true);
    deleteBtn.parentNode?.replaceChild(newDeleteBtn, deleteBtn);
    newDeleteBtn.addEventListener('click', () => {
        const current = Array.isArray(objectItems.value) ? objectItems.value : [];
        const index = details.index;
        if (index >= 0 && index < current.length) {
            const newArray = [...current];
            newArray.splice(index, 1);
            objectItems.value = newArray;
        }
    });
}

bindToList(objectListEl, objectItems, objectSetter, null, { debounceTime: 0 });

// --- Кнопки управления ---
document.getElementById('toggle-first-done')?.addEventListener('click', () => {
    const current = Array.isArray(objectItems.value) ? objectItems.value : [];
    if (current.length > 0) {
        const newArray = [...current];
        newArray[0] = { ...newArray[0], done: !newArray[0].done };
        objectItems.value = newArray;
    }
});

document.getElementById('update-first-name')?.addEventListener('click', () => {
    const current = Array.isArray(objectItems.value) ? objectItems.value : [];
    if (current.length > 0) {
        const newArray = [...current];
        newArray[0] = { ...newArray[0], name: `Updated-${Date.now()}` };
        objectItems.value = newArray;
    }
});

document.getElementById('add-object-btn')?.addEventListener('click', () => {
    const current = Array.isArray(objectItems.value) ? objectItems.value : [];
    const newId = current.length > 0 ? Math.max(...current.map(i => i.id)) + 1 : 1;
    objectItems.value = [...current, { id: newId, name: `Task ${newId}`, done: false }];
});
