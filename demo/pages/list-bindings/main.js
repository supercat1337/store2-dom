// @ts-check

import { autorun, collection } from '@supercat1337/store2';
import {
    bindToList,
    getDiffs,
    getElement,
    getElementById,
    ListItemHelper,
    ListItemUpdateContext,
} from '@supercat1337/store2-dom';

// ============================================================
// 1. Simple list with DOM template (first child is cloned)
// ============================================================

const simpleListEl = getElementById('simple-list', HTMLUListElement);
const simpleCountEl = getElementById('simple-count', HTMLSpanElement);

const simpleItems = collection(['Apple', 'Banana', 'Cherry']);

// Reactively update the item counter
autorun(() => {
    simpleCountEl.textContent = `${simpleItems.value.length} items`;
});

// Bind the list – using the first <li> inside simpleListEl as the template
bindToList(
    simpleListEl,
    simpleItems,
    // onUpdateItem – called on creation and every update
    (helper, details) => {
        const textSpan = getElement('.item-text', HTMLSpanElement, details.itemElement);
        textSpan.textContent = details.value;

        // Add/update an index badge if it doesn't exist yet
        let indexSpan = details.itemElement.querySelector('.item-index');
        if (!indexSpan) {
            indexSpan = document.createElement('span');
            indexSpan.className = 'item-index';
            details.itemElement.prepend(indexSpan);
        }
        indexSpan.textContent = String(details.index + 1);
    },
    null, // createItem – uses template from DOM (first child)
    { debounceTime: 0 }
);

// --- Controls ---
const addItemBtn = getElementById('add-item-btn', HTMLButtonElement);
addItemBtn.addEventListener('click', () => {
    simpleItems.value.push(`Item ${simpleItems.value.length + 1}`);
});

const removeLastBtn = getElementById('remove-last-btn', HTMLButtonElement);
removeLastBtn.addEventListener('click', () => {
    simpleItems.value.pop();
});

const resetListBtn = getElementById('reset-list-btn', HTMLButtonElement);
resetListBtn.addEventListener('click', () => {
    // Full replacement – triggers a complete rebuild (expected for reset)
    simpleItems.value = ['Apple', 'Banana', 'Cherry'];
});

// ============================================================
// 2. Custom creator (no DOM template) – fully programmatic
// ============================================================

const customListEl = getElementById('custom-list', HTMLDivElement);

const customItems = collection(['First', 'Second', 'Third']);

/**
 * createItem for custom list – creates a new DOM element with event listeners.
 * Called only once per item.
 * @param {ListItemHelper} helper
 * @returns {HTMLElement}
 */
function createCustomItem(helper) {
    const div = document.createElement('div');
    div.className = 'custom-item';

    const textSpan = document.createElement('span');
    textSpan.className = 'custom-text';
    div.appendChild(textSpan);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'custom-delete';
    deleteBtn.textContent = '✕';
    div.appendChild(deleteBtn);

    // Attach event listener once – uses helper to get the current index
    deleteBtn.addEventListener('click', () => {
        const index = helper.getListItemIndex(div);
        if (index === -1) return;
        customItems.value.splice(index, 1);
    });

    return div;
}

/**
 * onUpdateItem for custom list – updates the DOM when data changes.
 * Called on every update (including initial render).
 * @param {ListItemHelper} helper
 * @param {ListItemUpdateContext<string>} details
 */
function updateCustomItem(helper, details) {
    const div = details.itemElement;
    const textSpan = getElement('.custom-text', HTMLSpanElement, div);
    textSpan.textContent = details.value;
}

bindToList(customListEl, customItems, updateCustomItem, createCustomItem, { debounceTime: 0 });

// --- Controls ---
const addCustomBtn = getElementById('add-custom-btn', HTMLButtonElement);
addCustomBtn.addEventListener('click', () => {
    customItems.value.push(`Custom ${Date.now()}`);
});

const removeLastCustomBtn = getElementById('remove-last-custom-btn', HTMLButtonElement);
removeLastCustomBtn.addEventListener('click', () => {
    customItems.value.pop();
});

// ============================================================
// 3. Object list with getDiffs – minimal DOM updates
// ============================================================

const objectListEl = getElementById('object-list', HTMLUListElement);

/** @typedef {Object} TodoItem @property {number} id @property {string} name @property {boolean} done */

/** @type {import('@supercat1337/store2').Collection<TodoItem>} */
const objectItems = collection([
    { id: 1, name: 'Learn store2', done: false },
    { id: 2, name: 'Build demo', done: true },
    { id: 3, name: 'Write tests', done: false },
]);

/**
 * createItem for object list – creates a new list item and attaches event listeners.
 * @param {ListItemHelper} helper
 * @returns {HTMLElement}
 */
function createObjectItem(helper) {
    const template = helper.getTemplate();
    if (!template) throw new Error('No template');

    const checkbox = getElement('.obj-done', HTMLInputElement, template);
    const deleteBtn = getElement('.obj-delete', HTMLButtonElement, template);

    // Change handler – updates the done status of the item
    checkbox.addEventListener('change', () => {
        const index = helper.getListItemIndex(template);
        if (index === -1) return;
        const current = objectItems.value;
        if (index >= 0 && index < current.length) {
            objectItems.value[index] = { ...current[index], done: checkbox.checked };
        }
    });

    // Delete handler – removes the item from the collection
    deleteBtn.addEventListener('click', () => {
        const index = helper.getListItemIndex(template);
        if (index === -1) return;
        if (index >= 0 && index < objectItems.value.length) {
            objectItems.value.splice(index, 1);
        }
    });

    return template;
}

/**
 * onUpdateItem for object list – updates only changed properties using getDiffs.
 * @param {ListItemHelper} helper
 * @param {ListItemUpdateContext<TodoItem>} details
 */
function updateObjectItem(helper, details) {
    const li = details.itemElement;

    const checkbox = getElement('.obj-done', HTMLInputElement, li);
    const nameSpan = getElement('.obj-name', HTMLSpanElement, li);
    const idSpan = getElement('.obj-id', HTMLSpanElement, li);

    const diffs = getDiffs(details.value, details.oldValue || {});

    if (diffs.name) {
        nameSpan.textContent = details.value.name;
    }
    if (diffs.done) {
        checkbox.checked = details.value.done;
        li.classList.toggle('done', details.value.done);
    }
    if (diffs.id) {
        idSpan.textContent = String(details.value.id);
    }
}

bindToList(objectListEl, objectItems, updateObjectItem, createObjectItem, { debounceTime: 0 });

// --- Controls ---
const addObjectBtn = getElementById('add-object-btn', HTMLButtonElement);
addObjectBtn.addEventListener('click', () => {
    const newId =
        objectItems.value.length > 0 ? Math.max(...objectItems.value.map(i => i.id)) + 1 : 1;
    objectItems.value.push({ id: newId, name: `Task ${newId}`, done: false });
});

const toggleFirstDoneBtn = getElementById('toggle-first-done', HTMLButtonElement);
toggleFirstDoneBtn.addEventListener('click', () => {
    if (objectItems.value.length > 0) {
        objectItems.value[0] = { ...objectItems.value[0], done: !objectItems.value[0].done };
    }
});

const updateFirstNameBtn = getElementById('update-first-name', HTMLButtonElement);
updateFirstNameBtn.addEventListener('click', () => {
    if (objectItems.value.length > 0) {
        objectItems.value[0] = { ...objectItems.value[0], name: `Updated-${Date.now()}` };
    }
});
