// @ts-check

import { deepReactive } from '@supercat1337/store2-deep';
import { collection, runInAction, atom, batch, computed } from '@supercat1337/store2';
import { debounce } from '@supercat1337/store2'; // или из вашего пути
import { bindToList, bindToText, getDiffs, getElement } from '@supercat1337/store2-dom';

/** @typedef {{ id: number; text: string; done: boolean }} Todo */

/**
 * Sets up a MutationObserver on a list element to log added/removed <li> items.
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

export function renderDeep() {
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
        <ul id="todo-list">
            <li>
                <input type="checkbox" class="todo-checkbox" />
                <span class="todo-text"></span>
                <span class="todo-id" style="color:#999;font-size:0.8rem;"></span>
                <button class="todo-delete">✕</button>
            </li>
        </ul>
        <div class="todo-footer">
            <span class="todo-stats" id="todo-stats">Total: 0 | Active: 0 | Done: 0</span>
            <button id="clear-completed-btn" class="secondary">Clear Completed</button>
        </div>
    `;

    // --- Deep reactive state with onChange ---
    const state = deepReactive(
        {
            todos: [
                { id: 1, text: 'Learn store2', done: true },
                { id: 2, text: 'Build todo app', done: false },
                { id: 3, text: 'Write documentation', done: false },
            ],
        },
        {
            /**
             * Callback invoked on every mutation.
             * We use it to trigger synchronization of filteredTodos.
             */
            onChange: (path, oldValue, newValue, target) => {
                // Filter out changes that don't affect the todos array
                // For simplicity, we sync on any change, but we could check path[0] === 'todos'
                debouncedSync();
            },
        }
    );

    const filterAtom = atom('all', { name: 'filter' });

    // Separate collection for filtered view – will be synced via onChange
    const filteredTodos = collection([], { name: 'filteredTodos' });

    // --- Statistics ---
    const stats = computed(
        () => {
            const all = state.todos;
            const total = all.length;
            const done = all.filter(t => t.done).length;
            return `Total: ${total} | Active: ${total - done} | Done: ${done}`;
        },
        { name: 'stats' }
    );

    // --- Sync function: updates filteredTodos based on current filter ---
    function syncFilteredTodos() {
        runInAction(() => {
            const all = state.todos;
            const f = filterAtom.value;
            let filtered;
            if (f === 'active') filtered = all.filter(t => !t.done);
            else if (f === 'completed') filtered = all.filter(t => t.done);
            else filtered = [...all];
            filteredTodos.value = filtered;
        });
    }

    // Debounced version to group multiple mutations (e.g., within a batch)
    const debouncedSync = debounce(syncFilteredTodos, 0);

    // Initial sync
    syncFilteredTodos();

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
            filterAtom.value = /** @type {string} */ (
                /** @type {HTMLButtonElement} */ (btn).dataset.filter
            );
            // Filter change also triggers sync (though onChange will catch it)
            // but we call it explicitly to be safe
            debouncedSync();
        });
    });

    // --- Add todo ---
    addBtn.addEventListener('click', () => {
        const text = newTodoInput.value.trim();
        if (!text) return;
        const all = state.todos;
        const maxId = all.reduce((max, t) => Math.max(max, t.id), 0);
        const newId = maxId + 1;
        batch(() => {
            state.todos.push({ id: newId, text, done: false });
        });
        newTodoInput.value = '';
    });

    // --- Clear completed ---
    clearBtn.addEventListener('click', () => {
        batch(() => {
            state.todos = state.todos.filter(t => !t.done);
        });
    });

    let createCount = 0;
    let updateCount = 0;

    // --- List rendering ---
    function createTodoItem(helper) {
        createCount++;
        console.log(`createTodoItem called (total: ${createCount})`);
        const template = helper.getTemplate();
        if (!template) throw new Error('No template');
        return template;
    }

    function updateTodoItem(helper, context) {
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

    // Bind the list to the filtered collection
    bindToList(todoListEl, filteredTodos, updateTodoItem, createTodoItem, {
        getKey: 'id',
        debounceTime: 0,
    });

    // --- Setup MutationObserver for debugging ---
    const observer = setupListObserver(todoListEl, '[Deep]');

    // --- Event delegation ---
    // Delete
    todoListEl.addEventListener('click', e => {
        const target = /** @type {HTMLElement} */ (e.target);
        if (!target.classList.contains('todo-delete')) return;
        const li = target.closest('li');
        if (!li?.dataset.key) return;
        const id = Number(li.dataset.key);
        const all = state.todos;
        const index = all.findIndex(t => t.id === id);
        if (index !== -1) {
            batch(() => {
                all.splice(index, 1);
            });
        }
    });

    // Toggle done status
    todoListEl.addEventListener('change', e => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        if (!target.classList.contains('todo-checkbox')) return;
        const li = target.closest('li');
        if (!li?.dataset.key) return;
        const id = Number(li.dataset.key);
        const all = state.todos;
        const index = all.findIndex(t => t.id === id);
        if (index !== -1) {
            batch(() => {
                all[index].done = target.checked;
            });
        }
    });

    return container;
}
