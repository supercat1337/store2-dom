// @ts-check

import { collection, atom, computed, batch, autorun } from '@supercat1337/store2';
import {
    bindToList,
    bindToText,
    bindToInput,
    bindToCheckbox,
    bindToCssClass,
    bindToShow,
    getDiffs,
    ListItemHelper,
    ListItemSetterDetails,
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

/** @type {HTMLInputElement} */
const newTodoInput = /** @type {any} */ (document.getElementById('new-todo-input'));
/** @type {HTMLButtonElement} */
const addBtn = /** @type {any} */ (document.getElementById('add-todo-btn'));
/** @type {HTMLUListElement} */
const todoListEl = /** @type {any} */ (document.getElementById('todo-list'));
/** @type {HTMLSpanElement} */
const statsEl = /** @type {any} */ (document.getElementById('todo-stats'));
/** @type {HTMLButtonElement} */
const clearCompletedBtn = /** @type {any} */ (document.getElementById('clear-completed-btn'));

// ============================================================
// 4. Биндинги
// ============================================================

// 4.1. Поле ввода – двухсторонняя привязка к новому тексту
bindToInput(newTodoInput, newTodoText, { debounceTime: 0 });

// 4.2. Кнопка добавления
addBtn.addEventListener('click', () => {
    const text = newTodoText.value.trim();
    if (!text) return;
    const current = Array.isArray(todos.value) ? todos.value : [];
    const newId = current.length > 0 ? Math.max(...current.map(t => t.id)) + 1 : 1;
    todos.value = [...current, { id: newId, text, done: false }];
    newTodoText.value = ''; // очистка поля
});

// 4.3. Добавление по Enter
newTodoInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        addBtn.click();
    }
});

// 4.4. Статистика
bindToText(statsEl, stats);

// 4.5. Фильтры
document.querySelectorAll('.filters button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filter.value = /** @type {string} */ (btn.dataset.filter);
    });
});

// 4.6. Очистка выполненных
clearCompletedBtn.addEventListener('click', () => {
    todos.value = todos.value.filter(t => !t.done);
});

// ============================================================
// 5. Биндинг списка с использованием bindToList
// ============================================================

/**
 * @param {ListItemHelper} helper
 * @param {ListItemSetterDetails<Todo>} details
 */
function todoItemSetter(helper, details) {
    const li = details.itemElement;
    const checkbox = /** @type {HTMLInputElement} */ (li.querySelector('.todo-checkbox'));
    const textSpan = /** @type {HTMLSpanElement} */ (li.querySelector('.todo-text'));
    const idSpan = /** @type {HTMLSpanElement} */ (li.querySelector('.todo-id'));
    const deleteBtn = /** @type {HTMLButtonElement} */ (li.querySelector('.todo-delete'));

    // Используем getDiffs для частичного обновления
    const diffs = getDiffs(details.value, details.oldValue || {});

    if (diffs.text) {
        bindToText(textSpan, atom(details.value.text));
    }
    if (diffs.done) {
        checkbox.checked = details.value.done;
        // Класс для зачёркивания
        const doneAtom = atom(details.value.done);
        bindToCssClass(li, doneAtom, 'done');
    }
    if (diffs.id) {
        bindToText(idSpan, atom(String(details.value.id)));
    }

    // --- Обработчик чекбокса (изменение статуса) ---
    const newCheckbox = checkbox.cloneNode(true);
    checkbox.parentNode?.replaceChild(newCheckbox, checkbox);
    newCheckbox.addEventListener('change', () => {
        const current = Array.isArray(todos.value) ? todos.value : [];
        const index = details.index;
        if (index >= 0 && index < current.length) {
            const newTodos = [...current];
            newTodos[index] = { ...newTodos[index], done: newCheckbox.checked };
            todos.value = newTodos;
        }
    });

    // --- Обработчик удаления ---
    const newDeleteBtn = deleteBtn.cloneNode(true);
    deleteBtn.parentNode?.replaceChild(newDeleteBtn, deleteBtn);
    newDeleteBtn.addEventListener('click', () => {
        const current = Array.isArray(todos.value) ? todos.value : [];
        const index = details.index;
        if (index >= 0 && index < current.length) {
            const newTodos = [...current];
            newTodos.splice(index, 1);
            todos.value = newTodos;
        }
    });
}

// Привязываем список – используем шаблон (первый <li>)
bindToList(
    todoListEl,
    filteredTodos, // используем отфильтрованный список
    todoItemSetter,
    null, // используем шаблон
    { debounceTime: 0 }
);

// ============================================================
// 6. Начальные данные (для демонстрации)
// ============================================================
todos.value = [
    { id: 1, text: 'Learn store2', done: true },
    { id: 2, text: 'Build Todo App', done: false },
    { id: 3, text: 'Write documentation', done: false },
    { id: 4, text: 'Publish to npm', done: false },
];
