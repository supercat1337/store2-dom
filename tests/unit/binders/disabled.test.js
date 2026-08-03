// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToDisabled } from '../../../src/element-binders/disabled.js';
import { atom, Store } from '@supercat1337/store2';

test('bindToDisabled updates element.disabled property with boolean value', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const button = document.createElement('button');
    body.append(button);

    const store = new Store();
    const _atom = atom(true);

    bindToDisabled(button, _atom, { debounceTime: 0 });

    t.true(button.disabled);

    _atom.value = false;
    t.false(button.disabled);

    window.close();
});

test('bindToDisabled works with input elements', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const input = document.createElement('input');
    body.append(input);

    const store = new Store();
    const _atom = atom(true);

    bindToDisabled(input, _atom, { debounceTime: 0 });

    t.true(input.disabled);

    _atom.value = false;
    t.false(input.disabled);

    window.close();
});

test('bindToDisabled auto-disconnects when element is removed from DOM', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const button = document.createElement('button');
    body.append(button);

    const store = new Store();
    const _atom = atom(true);

    bindToDisabled(button, _atom, { debounceTime: 0 });

    t.true(button.disabled);

    const disabledBeforeRemove = button.disabled;
    button.remove();

    _atom.value = false;
    // autoDisconnect prevents updates after removal
    t.is(button.disabled, disabledBeforeRemove);

    window.close();
});
