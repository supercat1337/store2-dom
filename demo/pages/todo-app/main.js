// @ts-check

import { atom, collection, computed } from '@supercat1337/store2';
import {
    bindToInput,
    bindToList,
    bindToText,
    getDiffs,
    ListItemHelper,
    ListItemUpdateContext
} from '@supercat1337/store2-dom';

// ============================================================
// 1. Состояние (State)
// ============================================================

/** @typedef {Object} Todo @property {number} id @property {string} text @property {boolean} done */

/** @type {import('@supercat1337/store2').Collection<Todo>} */
const todos = collection([]);

/** @type {import('@supercat1337/store2').Atom<string>} */
const filter = atom('all');

/** @type {import('@supercat1337/store2').Atom<string>} */
const newTodoText = atom('');

// ============================================================
// 2. Вычисляемые значения (Computed)
// ============================================================

/** @type {import('@supercat1337/store2').Computed<Todo[]>} */
const filteredTodos = computed(() => {
    const all = todos.value;
    const f = filter.value;
    if (f === 'all') return [...all];
    if (f === 'active') return all.filter(t => !t.done);
    if (f === 'completed') return all.filter(t => t.done);
    return [...all];
});

/** @type {import('@supercat1337/store2').Computed<string>} */
const stats = computed(() => {
    const all = todos.value;
    const total = all.length;
    const done = all.filter(t => t.done).length;
    const active = total - done;
    return `Total: ${total} | Active: ${active} | Done: ${done}`;
});

// ============================================================
// 3. DOM-элементы
// ============================================================

const newTodoInput = /** @type {HTMLInputElement} */ (document.getElementById('new-todo-input'));
const addBtn = /** @type {HTMLButtonElement} */ (document.getElementById('add-todo-btn'));
const todoListEl = /** @type {HTMLUListElement} */ (document.getElementById('todo-list'));
const statsEl = /** @type {HTMLSpanElement} */ (document.getElementById('todo-stats'));
const clearCompletedBtn = /** @type {HTMLButtonElement} */ (
    document.getElementById('clear-completed-btn')
);

// ============================================================
// 4. Биндинги
// ============================================================

bindToInput(newTodoInput, newTodoText, { debounceTime: 0 });

addBtn.addEventListener('click', () => {
    const text = newTodoText.value.trim();
    if (!text) return;
    const current = Array.isArray(todos.value) ? todos.value : [];
    const newId = current.length > 0 ? Math.max(...current.map(t => t.id)) + 1 : 1;
    todos.value = [...current, { id: newId, text, done: false }];
    newTodoText.value = '';
});

newTodoInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') addBtn.click();
});

bindToText(statsEl, stats);

document.querySelectorAll('.filters button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filter.value = /** @type {string} */ (btn.dataset.filter);
    });
});

clearCompletedBtn.addEventListener('click', () => {
    todos.value = todos.value.filter(t => !t.done);
});

// ============================================================
// 5. Биндинг списка
// ============================================================

/**
 * @param {ListItemHelper} helper
 * @returns {HTMLElement}
 */
function createTodoItem(helper) {
    const template = helper.getTemplate();
    if (!template) throw new Error('No template');

    const checkbox = /** @type {HTMLInputElement} */ (template.querySelector('.todo-checkbox'));
    const deleteBtn = /** @type {HTMLButtonElement} */ (template.querySelector('.todo-delete'));

    checkbox.addEventListener('change', () => {
        const index = helper.getListItemIndex(template);
        if (index === -1) return;
        const current = Array.isArray(todos.value) ? todos.value : [];
        if (index >= 0 && index < current.length) {
            const newTodos = [...current];
            newTodos[index] = { ...newTodos[index], done: checkbox.checked };
            todos.value = newTodos;
        }
    });

    deleteBtn.addEventListener('click', () => {
        const index = helper.getListItemIndex(template);
        if (index === -1) return;
        const current = Array.isArray(todos.value) ? todos.value : [];
        if (index >= 0 && index < current.length) {
            const newTodos = [...current];
            newTodos.splice(index, 1);
            todos.value = newTodos;
        }
    });

    return template;
}

/**
 * @param {ListItemHelper} helper
 * @param {ListItemUpdateContext<Todo>} details
 */
function todoonUpdateItem(helper, details) {
    const li = details.itemElement;
    const checkbox = /** @type {HTMLInputElement} */ (li.querySelector('.todo-checkbox'));
    const textSpan = /** @type {HTMLSpanElement} */ (li.querySelector('.todo-text'));
    const idSpan = /** @type {HTMLSpanElement} */ (li.querySelector('.todo-id'));

    const diffs = getDiffs(details.value, details.oldValue || {});

    if (diffs.text) {
        textSpan.textContent = details.value.text;
    }
    if (diffs.done) {
        checkbox.checked = details.value.done;
        li.classList.toggle('done', details.value.done);
    }
    if (diffs.id) {
        idSpan.textContent = String(details.value.id);
    }
}

bindToList(todoListEl, filteredTodos, todoonUpdateItem, createTodoItem, { debounceTime: 0 });

// ============================================================
// 6. Начальные данные
// ============================================================
todos.value = [
    { id: 1, text: 'Learn store2', done: true },
    { id: 2, text: 'Build Todo App', done: false },
    { id: 3, text: 'Write documentation', done: false },
    { id: 4, text: 'Publish to npm', done: false },
];
