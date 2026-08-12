// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToCheckbox } from '../../../src/element-binders/two-way-bindings/checkbox-checked.js';
import { atom, computed } from '@supercat1337/store2';

test('bindToCheckbox two-way binding updates checkbox.checked from atom', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    document.body.append(checkbox);
    const _atom = atom(true);
    const unsub = bindToCheckbox(checkbox, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.true(checkbox.checked);
    _atom.value = false;
    t.false(checkbox.checked);
});

test('bindToCheckbox two-way binding updates atom from checkbox click', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    document.body.append(checkbox);
    const _atom = atom(false);
    const unsub = bindToCheckbox(checkbox, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.false(checkbox.checked);
    t.false(_atom.value);
    checkbox.click();
    t.true(checkbox.checked);
    t.true(_atom.value);
    checkbox.click();
    t.false(checkbox.checked);
    t.false(_atom.value);
});

test('bindToCheckbox auto-disconnects when element is removed from DOM', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    document.body.append(checkbox);
    const _atom = atom(true);
    const unsub = bindToCheckbox(checkbox, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.true(checkbox.checked);
    checkbox.remove();
    _atom.value = false;
    t.true(checkbox.checked);
});

test('bindToCheckbox throws error when not given Atom', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    document.body.append(checkbox);
    const atomValue = atom(0);
    const computedValue = computed(() => atomValue.value);
    t.throws(
        () => {
            bindToCheckbox(checkbox, computedValue);
        },
        { message: /bindToCheckbox expects an Atom/ }
    );
    window.close();
});
