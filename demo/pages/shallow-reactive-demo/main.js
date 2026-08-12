// @ts-check

import { shallowReactive, computed } from '@supercat1337/store2';
import { bindToText, getElementById } from '@supercat1337/store2-dom';

// ============================================================
// 1. Reactive state (shallow)
// ============================================================

const state = shallowReactive({
    name: 'Alex',
    age: 30,
    role: 'Developer',
});

// ============================================================
// 2. Computed getters for each field
// ============================================================

const nameDisplay = computed(() => state.value.name);
const ageDisplay = computed(() => state.value.age);
const roleDisplay = computed(() => state.value.role);

// ============================================================
// 3. DOM elements
// ============================================================

const nameSpan = getElementById('name-display', HTMLSpanElement);
const ageSpan = getElementById('age-display', HTMLSpanElement);
const roleSpan = getElementById('role-display', HTMLSpanElement);

// ============================================================
// 4. Bindings
// ============================================================

bindToText(nameSpan, nameDisplay);
bindToText(ageSpan, ageDisplay);
bindToText(roleSpan, roleDisplay);

// ============================================================
// 5. Controls – mutate state directly (shallow reactivity)
// ============================================================

const updateNameBtn = getElementById('update-name-btn', HTMLButtonElement);
updateNameBtn.addEventListener('click', () => {
    state.value.name = `Alex-${Math.floor(Math.random() * 100)}`;
});

const updateAgeBtn = getElementById('update-age-btn', HTMLButtonElement);
updateAgeBtn.addEventListener('click', () => {
    state.value.age += 1;
});

const updateRoleBtn = getElementById('update-role-btn', HTMLButtonElement);
updateRoleBtn.addEventListener('click', () => {
    const roles = ['Developer', 'Designer', 'Manager', 'Tester'];
    const current = roles.indexOf(state.value.role);
    state.value.role = roles[(current + 1) % roles.length];
});

const resetBtn = getElementById('reset-btn', HTMLButtonElement);
resetBtn.addEventListener('click', () => {
    state.value.name = 'Alex';
    state.value.age = 30;
    state.value.role = 'Developer';
});
