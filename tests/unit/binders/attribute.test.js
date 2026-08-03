// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToAttribute } from '../../../src/element-binders/attribute.js';
import { atom, Store } from '@supercat1337/store2';

test('bindToAttr', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom('test-value');

    bindToAttribute(div, _atom, 'test', { debounceTime: 0 });

    t.is(div.getAttribute('test'), 'test-value');

    _atom.value = '123';
    t.is(div.getAttribute('test'), '123');

    const valueBeforeRemove = div.getAttribute('test');

    div.remove();

    _atom.value = '321';
    t.is(div.getAttribute('test'), valueBeforeRemove);

    window.close();
});

test('bindToAttr with null value', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = /** @type {import("@supercat1337/store2").Atom<string | null>} */ (
        atom('test-value')
    );

    bindToAttribute(div, _atom, 'test', { debounceTime: 0 });

    t.is(div.getAttribute('test'), 'test-value');

    _atom.value = '123';
    t.is(div.getAttribute('test'), '123');

    _atom.value = null;
    t.false(div.hasAttribute('test'));

    window.close();
});
