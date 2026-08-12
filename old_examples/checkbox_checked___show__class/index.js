// @ts-check

import { atom, computed } from '@supercat1337/store2';
import {
    bindToCheckbox,
    bindToClassString,
    bindToShow,
    getElementById,
} from '@supercat1337/store2-dom';

// ==========================================
// 1. DOM Elements
// ==========================================

const showCheckbox = getElementById('show_checkbox', HTMLInputElement);
const dangerCheckbox = getElementById('make_danger_checkbox', HTMLInputElement);
const blockElement = getElementById('sample_div', HTMLDivElement);
const textElement = getElementById('sample_text', HTMLSpanElement);

// ==========================================
// 2. Reactive State
// ==========================================

// Atom controlling visibility of the block
const showAtom = atom(false);

// Computed that mirrors showAtom – demonstrates usage with bindToShow
const showComputed = computed(() => showAtom.value);

// Atom controlling the "danger" class
const dangerAtom = atom(false);

// Computed that returns class names based on dangerAtom
const dangerClassNameComputed = computed(() => (dangerAtom.value ? 'text-danger display-6' : ''));

// ==========================================
// 3. Bindings
// ==========================================

// Two-way binding: checkbox ↔ showAtom
bindToCheckbox(showCheckbox, showAtom);

// One-way binding: showComputed → element visibility (adds/removes 'd-none' class)
bindToShow(blockElement, showComputed);

// Two-way binding: checkbox ↔ dangerAtom
bindToCheckbox(dangerCheckbox, dangerAtom);

// One-way binding: dangerClassNameComputed → element.className
bindToClassString(textElement, dangerClassNameComputed);
