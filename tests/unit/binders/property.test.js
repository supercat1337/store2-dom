// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToProperty } from '../../../src/element-binders/property.js';
import { atom } from '@supercat1337/store2';

test('bindToProperty updates element property with reactive value', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const button = document.createElement('button');
    document.body.append(button);
    const _atom = atom(true);
    const unsub = bindToProperty(button, _atom, 'disabled', { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.true(button.disabled);
    _atom.value = false;
    t.false(button.disabled);
});

test('bindToProperty works with string properties', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom('original title');
    const unsub = bindToProperty(div, _atom, 'title', { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(div.title, 'original title');
    _atom.value = 'new title';
    t.is(div.title, 'new title');
});

test('bindToProperty auto-disconnects when element is removed from DOM', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const button = document.createElement('button');
    document.body.append(button);
    const _atom = atom(true);
    const unsub = bindToProperty(button, _atom, 'disabled', { debounceTime: 0 });

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
