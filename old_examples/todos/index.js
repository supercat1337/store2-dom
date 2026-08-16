// @ts-check

import { atom, collection, computed } from '@supercat1337/store2';
import { tasks_service } from './task-service.js';

import {
    bindToDisabled,
    bindToInput,
    bindToList,
    bindToText,
    getElement,
    ListItemHelper,
    ListItemUpdateContext,
} from '@supercat1337/store2-dom';

// ============================================================
// 1. State (Model)
// ============================================================

/** @type {import('@supercat1337/store2').Collection<import('./task-service.js').ItemData>} */
const todos = collection([]);

/** @type {import('@supercat1337/store2').Computed<string>} */
const todosLength = computed(() => String(todos.value.length));

/** @type {import('@supercat1337/store2').Atom<string>} */
const filterInput = atom('');

/** @type {import('@supercat1337/store2').Computed<boolean>} */
const isFilterActive = computed(() => filterInput.value.length > 0);

// ============================================================
// 2. DOM Elements (View)
// ============================================================

const rootList = getElement('[ref="root_list"]', HTMLUListElement);
const addTodoButton = getElement('[ref="add_todo_button"]', HTMLButtonElement);
const addTodoInput = getElement('[ref="add_todo_input"]', HTMLInputElement);
const filterTodoInput = getElement('[ref="filter_todo_input"]', HTMLInputElement);
const listLengthSpan = getElement('[ref="list_length_span"]', HTMLSpanElement);

// ============================================================
// 3. Presenter (Event Handlers)
// ============================================================

/**
 * Handles adding a new todo (click or Enter key).
 * @param {Event|KeyboardEvent} e
 */
async function addTaskCallback(e) {
    if (e instanceof KeyboardEvent && e.key !== 'Enter') return;

    const todoName = addTodoInput.value.trim();
    addTodoInput.value = '';

    if (todoName) {
        const task = await tasks_service.add({ text: todoName, done: false });
        todos.value.push(task);
    }
}

addTodoButton.addEventListener('click', addTaskCallback);
addTodoInput.addEventListener('keydown', addTaskCallback);

/**
 * Filters the todo list based on the filter input text.
 */
async function filterTodos() {
    const filterText = filterTodoInput.value;
    const allTasks = await tasks_service.requestData();

    if (!filterText) {
        todos.value = allTasks;
    } else {
        const filtered = allTasks.filter(item => item.text.includes(filterText));
        todos.value = filtered;
    }
}

filterTodoInput.addEventListener('input', filterTodos);

// ============================================================
// 4. List Binding Helpers
// ============================================================

/**
 * Updates an existing list item when its data changes.
 * @param {ListItemHelper} helper
 * @param {ListItemUpdateContext<import('./task-service.js').ItemData>} details
 */
function onUpdateItem(helper, details) {
    const itemElement = details.itemElement;
    const textSpan = /** @type {HTMLSpanElement} */ (itemElement.querySelector('[ref="text"]'));
    const checkbox = /** @type {HTMLInputElement} */ (
        itemElement.querySelector('[ref="checkbox"]')
    );

    const diffs = helper.getDiffs(details.value, details.oldValue);

    if (diffs.text) {
        textSpan.textContent = details.value.text;
    }
    if (diffs.done) {
        checkbox.checked = details.value.done;
        textSpan.classList.toggle('text-decoration-line-through', details.value.done);
    }
}

/**
 * Creates a new list item element with event listeners.
 * @param {ListItemHelper} helper
 * @returns {HTMLElement}
 */
function createItem(helper) {
    // Use the explicit template
    const templateEl = document.getElementById('todo-item-template');
    if (!(templateEl instanceof HTMLTemplateElement)) {
        throw new Error('Template not found');
    }
    const fragment = document.importNode(templateEl.content, true);
    const itemElement = /** @type {HTMLElement} */ (fragment.firstElementChild);
    if (!itemElement) throw new Error('Template has no element child');

    const deleteBtn = /** @type {HTMLButtonElement} */ (
        itemElement.querySelector('[ref="delete_button"]')
    );
    const checkbox = /** @type {HTMLInputElement} */ (
        itemElement.querySelector('[ref="checkbox"]')
    );

    // Delete handler – uses helper.getKey to get the task_id as a string
    deleteBtn.addEventListener('click', () => {
        const key = helper.getKey(itemElement);
        if (key === undefined) return;
        const index = helper.findIndex(todos.value, key);
        if (index !== -1) {
            const task = todos.value[index];
            if (task) {
                tasks_service.delete(task.task_id);
                todos.value.splice(index, 1);
            }
        }
    });

    // Change handler – uses helper.getKey
    checkbox.addEventListener('change', async () => {
        const key = helper.getKey(itemElement);
        if (key === undefined) return;
        const index = helper.findIndex(todos.value, key);
        if (index !== -1) {
            const current = todos.value[index];
            const updated = { ...current, done: checkbox.checked };
            todos.value[index] = updated;
            await tasks_service.update(updated);
        }
    });

    return itemElement;
}

// ============================================================
// 5. Bindings
// ============================================================

bindToText(listLengthSpan, todosLength);
bindToInput(filterTodoInput, filterInput);
bindToDisabled(addTodoButton, isFilterActive);
bindToDisabled(addTodoInput, isFilterActive);

// Load initial data and bind the list
todos.value = await tasks_service.requestData();

// Bind the list with explicit template and getKey
bindToList(rootList, todos, onUpdateItem, {
    createItem: createItem,
    getKey: 'task_id', // the key is a string (task_id)
    debounceTime: 0,
    onRemoveItem: (el, value, index) => {
        console.log(`Removing todo "${value.text}" (${value.task_id}) at index ${index}`);
    },
});
