// @ts-check

import { atom, batch, collection, computed } from '@supercat1337/store2';
import {
    bindToList,
    bindToText,
    getDiffs,
    getElement,
    ListItemHelper,
    ListItemUpdateContext,
} from '@supercat1337/store2-dom';

/** @typedef {{ id: number; text: string; done: boolean }} Todo */

/**
 * Sets up a MutationObserver on a list element to log added/removed <li> items.
 * Useful for debugging whether the list is rendered incrementally or fully rebuilt.
 *
 * @param {HTMLUListElement} listElement - The <ul> element to observe.
 * @param {string} [logPrefix=''] - Optional prefix for console logs (e.g., '[Computed]').
 * @returns {MutationObserver} The observer instance (can be disconnected if needed).
 */
function setupListObserver(listElement, logPrefix = '') {
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.matches('li')) {
                        const key = node.dataset.key || '(no key)';
                        console.log(`${logPrefix} Added LI: ${key}`);
                    }
                });
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.matches('li')) {
                        const key = node.dataset.key || '(no key)';
                        console.log(`${logPrefix} Removed LI: ${key}`);
                    }
                });
            }
        });
    });

    observer.observe(listElement, {
        childList: true,
        subtree: false,
    });

    return observer;
}

/**
 * Renders the computed-based todo app.
 * @returns {HTMLElement} The app container
 */
export function renderComputed() {
    const container = document.createElement('div');

    container.innerHTML = `
        <div class="todo-form">
            <input type="text" id="new-todo-input" placeholder="What needs to be done?" />
            <button id="add-todo-btn">Add</button>
        </div>
        <div class="filters">
            <button data-filter="all" class="active">All</button>
            <button data-filter="active">Active</button>
            <button data-filter="completed">Completed</button>
        </div>
        <ul id="todo-list"></ul>
        <div class="todo-footer">
            <span class="todo-stats" id="todo-stats">Total: 0 | Active: 0 | Done: 0</span>
            <button id="clear-completed-btn" class="secondary">Clear Completed</button>
        </div>
    `;

    // --- State ---
    const todos = collection([
        { id: 1, text: 'Learn store2', done: true },
        { id: 2, text: 'Build todo app', done: false },
        { id: 3, text: 'Write documentation', done: false },
    ]);

    const filter = atom('all');

    // --- Computed ---
    const filteredTodos = computed(() => {
        const all = todos.value;
        const f = filter.value;
        if (f === 'active') return all.filter(t => !t.done);
        if (f === 'completed') return all.filter(t => t.done);
        return [...all];
    });

    const stats = computed(() => {
        const all = todos.value;
        const total = all.length;
        const done = all.filter(t => t.done).length;
        return `Total: ${total} | Active: ${total - done} | Done: ${done}`;
    });

    // --- DOM elements ---
    const todoListEl = getElement('#todo-list', HTMLUListElement, container);
    const statsEl = getElement('#todo-stats', HTMLSpanElement, container);
    const newTodoInput = getElement('#new-todo-input', HTMLInputElement, container);
    const addBtn = getElement('#add-todo-btn', HTMLButtonElement, container);
    const clearBtn = getElement('#clear-completed-btn', HTMLButtonElement, container);

    // --- Bindings ---
    bindToText(statsEl, stats);

    // Filter buttons
    container.querySelectorAll('.filters button').forEach(btn => {
        btn.addEventListener('click', () => {
            container
                .querySelectorAll('.filters button')
                .forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filter.value = /** @type {string} */ (
                /** @type {HTMLButtonElement} */ (btn).dataset.filter
            );
        });
    });

    // Add todo
    addBtn.addEventListener('click', () => {
        const text = newTodoInput.value.trim();
        if (!text) return;
        const newId = todos.value.length > 0 ? Math.max(...todos.value.map(t => t.id)) + 1 : 1;
        batch(() => {
            todos.value.push({ id: newId, text, done: false });
        });
        newTodoInput.value = '';
    });

    // Clear completed
    clearBtn.addEventListener('click', () => {
        batch(() => {
            for (let i = todos.value.length - 1; i >= 0; i--) {
                if (todos.value[i].done) todos.value.splice(i, 1);
            }
        });
    });

    let updateCount = 0;
    /** @type {ListItemHelper | null} */
    let listHelper = null;

    /**
     * @param {ListItemHelper} helper
     * @param {ListItemUpdateContext<Todo>} context
     */
    function updateTodoItem(helper, context) {
        listHelper = helper; // store for use in event handlers
        updateCount++;
        console.log(`updateTodoItem called for key: ${context?.value?.id} (total: ${updateCount})`);
        if (!context?.value) return;
        const li = context.itemElement;
        const { value, oldValue } = context;

        const checkbox = getElement('.todo-checkbox', HTMLInputElement, li);
        const textSpan = getElement('.todo-text', HTMLSpanElement, li);
        const idSpan = getElement('.todo-id', HTMLSpanElement, li);

        const diffs = getDiffs(value, oldValue || {});
        if (diffs.text) textSpan.textContent = value.text;
        checkbox.checked = value.done;
        li.classList.toggle('done', value.done);
        if (diffs.id) idSpan.textContent = String(value.id);
    }

    // --- Bind the list with template ---
    const templateEl = document.getElementById('todo-item-template');
    if (!(templateEl instanceof HTMLTemplateElement)) {
        throw new Error('Template not found');
    }

    bindToList(todoListEl, filteredTodos, updateTodoItem, {
        template: templateEl,
        getKey: 'id',
        debounceTime: 0,
        onRemoveItem: (_itemElement, value, index) => {
            console.log(`Removing item with key ${value.id} at index ${index}`);
        },
    });

    // --- Setup MutationObserver for debugging ---
    setupListObserver(todoListEl, '[Computed]');

    // --- Event delegation ---
    todoListEl.addEventListener('click', e => {
        const target = /** @type {HTMLElement} */ (e.target);
        if (!target.classList.contains('todo-delete')) return;
        const li = target.closest('li');
        if (!li || !listHelper) return;
        const key = listHelper.getKey(li);
        if (key === undefined) return;
        const index = listHelper.findIndex(todos.value, key);
        if (index !== -1) {
            batch(() => {
                todos.value.splice(index, 1);
            });
        }
    });

    todoListEl.addEventListener('change', e => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        if (!target.classList.contains('todo-checkbox')) return;
        const li = target.closest('li');
        if (!li || !listHelper) return;
        const key = listHelper.getKey(li);
        if (key === undefined) return;
        const index = listHelper.findIndex(todos.value, key);
        if (index !== -1) {
            batch(() => {
                todos.value[index] = { ...todos.value[index], done: target.checked };
            });
        }
    });

    return container;
}
