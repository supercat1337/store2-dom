// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToCheckbox } from '../../../src/element-binders/two-way-bindings/checkbox-checked.js';
import { atom, Store } from '@supercat1337/store2';

test('bindToCheckbox two-way binding updates checkbox.checked from atom', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    body.append(checkbox);

    const store = new Store();
    const _atom = atom(true);

    bindToCheckbox(checkbox, _atom, { debounceTime: 0 });

    t.true(checkbox.checked);

    _atom.value = false;
    t.false(checkbox.checked);

    window.close();
});

test('bindToCheckbox two-way binding updates atom from checkbox click', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    body.append(checkbox);

    const store = new Store();
    const _atom = atom(false);

    bindToCheckbox(checkbox, _atom, { debounceTime: 0 });

    t.false(checkbox.checked);
    t.false(_atom.value);

    checkbox.click();
    t.true(checkbox.checked);
    t.true(_atom.value);

    checkbox.click();
    t.false(checkbox.checked);
    t.false(_atom.value);

    window.close();
});

test('bindToCheckbox auto-disconnects when element is removed from DOM', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    body.append(checkbox);

    const store = new Store();
    const _atom = atom(true);

    bindToCheckbox(checkbox, _atom, { debounceTime: 0 });

    t.true(checkbox.checked);

    checkbox.remove();
    _atom.value = false;

    // After removal, autoDisconnect should prevent updates
    t.true(checkbox.checked);

    window.close();
});
