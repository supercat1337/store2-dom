// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToDisabled } from '../../../src/element-binders/disabled.js';
import { atom } from '@supercat1337/store2';

test('bindToDisabled updates element.disabled property with boolean value', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const button = document.createElement('button');
    document.body.append(button);
    const _atom = atom(true);
    const unsub = bindToDisabled(button, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.true(button.disabled);
    _atom.value = false;
    t.false(button.disabled);
});

test('bindToDisabled works with input elements', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const input = document.createElement('input');
    document.body.append(input);
    const _atom = atom(true);
    const unsub = bindToDisabled(input, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.true(input.disabled);
    _atom.value = false;
    t.false(input.disabled);
});

test('bindToDisabled auto-disconnects when element is removed from DOM', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const button = document.createElement('button');
    document.body.append(button);
    const _atom = atom(true);
    const unsub = bindToDisabled(button, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.true(button.disabled);
    const disabledBeforeRemove = button.disabled;
    button.remove();
    _atom.value = false;
    t.is(button.disabled, disabledBeforeRemove);
});
