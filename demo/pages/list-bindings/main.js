// @ts-check

import { autorun, collection, batch } from '@supercat1337/store2';
import {
    bindToList,
    getDiffs,
    getElement,
    getElementById,
    ListItemHelper,
    ListItemUpdateContext,
} from '@supercat1337/store2-dom';

// ============================================================
// 1. Simple list with explicit template
// ============================================================

const simpleListEl = getElementById('simple-list', HTMLUListElement);
const simpleCountEl = getElementById('simple-count', HTMLSpanElement);

const simpleItems = collection(['Apple', 'Banana', 'Cherry']);

// Reactively update the item counter
autorun(() => {
    simpleCountEl.textContent = `${simpleItems.value.length} items`;
});

// Bind the list – using a <template> element
const simpleTemplate = document.getElementById('simple-item-template');
if (!(simpleTemplate instanceof HTMLTemplateElement)) {
    throw new Error('Simple template not found');
}

bindToList(
    simpleListEl,
    simpleItems,
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
    {
        template: simpleTemplate,
        debounceTime: 0,
    }
);

// --- Controls (wrapped in batch) ---
const addItemBtn = getElementById('add-item-btn', HTMLButtonElement);
addItemBtn.addEventListener('click', () => {
    batch(() => {
        simpleItems.value.push(`Item ${simpleItems.value.length + 1}`);
    });
});

const removeLastBtn = getElementById('remove-last-btn', HTMLButtonElement);
removeLastBtn.addEventListener('click', () => {
    batch(() => {
        simpleItems.value.pop();
    });
});

const resetListBtn = getElementById('reset-list-btn', HTMLButtonElement);
resetListBtn.addEventListener('click', () => {
    batch(() => {
        simpleItems.value = ['Apple', 'Banana', 'Cherry'];
    });
});

// ============================================================
// 2. Custom creator (no template) – fully programmatic
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
        batch(() => {
            customItems.value.splice(index, 1);
        });
    });

    return div;
}

/**
 * onUpdateItem for custom list – updates the DOM when data changes.
 * @param {ListItemHelper} helper
 * @param {ListItemUpdateContext<string>} details
 */
function updateCustomItem(helper, details) {
    const div = details.itemElement;
    const textSpan = getElement('.custom-text', HTMLSpanElement, div);
    textSpan.textContent = details.value;
}

bindToList(customListEl, customItems, updateCustomItem, {
    createItem: createCustomItem,
    debounceTime: 0,
});

// --- Controls (wrapped in batch) ---
const addCustomBtn = getElementById('add-custom-btn', HTMLButtonElement);
addCustomBtn.addEventListener('click', () => {
    batch(() => {
        customItems.value.push(`Custom ${Date.now()}`);
    });
});

const removeLastCustomBtn = getElementById('remove-last-custom-btn', HTMLButtonElement);
removeLastCustomBtn.addEventListener('click', () => {
    batch(() => {
        customItems.value.pop();
    });
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
    // Use the explicit template
    const templateEl = document.getElementById('object-item-template');
    if (!(templateEl instanceof HTMLTemplateElement)) {
        throw new Error('Object template not found');
    }
    const fragment = document.importNode(templateEl.content, true);
    const li = /** @type {HTMLElement} */ (fragment.firstElementChild);
    if (!li) throw new Error('Template has no element child');

    const checkbox = getElement('.obj-done', HTMLInputElement, li);
    const deleteBtn = getElement('.obj-delete', HTMLButtonElement, li);

    // Change handler – updates the done status of the item
    checkbox.addEventListener('change', () => {
        const key = helper.getKey(li);
        if (key === undefined) return;
        const index = helper.findIndex(objectItems.value, key);
        if (index !== -1) {
            batch(() => {
                objectItems.value[index] = { ...objectItems.value[index], done: checkbox.checked };
            });
        }
    });

    // Delete handler – removes the item from the collection
    deleteBtn.addEventListener('click', () => {
        const key = helper.getKey(li);
        if (key === undefined) return;
        const index = helper.findIndex(objectItems.value, key);
        if (index !== -1) {
            batch(() => {
                objectItems.value.splice(index, 1);
            });
        }
    });

    return li;
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

// --- Bind with getKey for efficient reconciliation ---
bindToList(objectListEl, objectItems, updateObjectItem, {
    createItem: createObjectItem,
    debounceTime: 0,
    getKey: 'id',
    onRemoveItem: (el, value, index) => {
        console.log(`Removing object item ${value.id} at index ${index}`);
    },
});

// --- Controls (wrapped in batch) ---
const addObjectBtn = getElementById('add-object-btn', HTMLButtonElement);
addObjectBtn.addEventListener('click', () => {
    const newId =
        objectItems.value.length > 0 ? Math.max(...objectItems.value.map(i => i.id)) + 1 : 1;
    batch(() => {
        objectItems.value.push({ id: newId, name: `Task ${newId}`, done: false });
    });
});

const toggleFirstDoneBtn = getElementById('toggle-first-done', HTMLButtonElement);
toggleFirstDoneBtn.addEventListener('click', () => {
    if (objectItems.value.length > 0) {
        batch(() => {
            objectItems.value[0] = { ...objectItems.value[0], done: !objectItems.value[0].done };
        });
    }
});

const updateFirstNameBtn = getElementById('update-first-name', HTMLButtonElement);
updateFirstNameBtn.addEventListener('click', () => {
    if (objectItems.value.length > 0) {
        batch(() => {
            objectItems.value[0] = { ...objectItems.value[0], name: `Updated-${Date.now()}` };
        });
    }
});
