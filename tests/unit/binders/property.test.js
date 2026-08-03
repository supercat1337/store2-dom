// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToProperty } from '../../../src/element-binders/property.js';
import { atom, Store } from '@supercat1337/store2';

test('bindToProperty updates element property with reactive value', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const button = document.createElement('button');
    body.append(button);

    const store = new Store();
    const _atom = atom(true);

    bindToProperty(button, _atom, 'disabled', { debounceTime: 0 });

    t.true(button.disabled);

    _atom.value = false;
    t.false(button.disabled);

    window.close();
});

test('bindToProperty works with string properties', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom('original title');

    bindToProperty(div, _atom, 'title', { debounceTime: 0 });

    t.is(div.title, 'original title');

    _atom.value = 'new title';
    t.is(div.title, 'new title');

    window.close();
});

test('bindToProperty auto-disconnects when element is removed from DOM', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const button = document.createElement('button');
    body.append(button);

    const store = new Store();
    const _atom = atom(true);

    bindToProperty(button, _atom, 'disabled', { debounceTime: 0 });

    t.true(button.disabled);

    const disabledBeforeRemove = button.disabled;
    button.remove();

    _atom.value = false;
    // autoDisconnect prevents updates after removal
    t.is(button.disabled, disabledBeforeRemove);

    window.close();
});
