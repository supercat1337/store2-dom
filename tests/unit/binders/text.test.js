// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToText } from '../../../src/element-binders/text.js';
import { atom, Store } from '@supercat1337/store2';

test('bindToText updates element.textContent with reactive string/number', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom('Hello');

    bindToText(div, _atom, { debounceTime: 0 });

    t.is(div.textContent, 'Hello');

    _atom.value = 'World';
    t.is(div.textContent, 'World');

    _atom.value = 123;
    t.is(div.textContent, '123');

    window.close();
});

test('bindToText auto-disconnects when element is removed from DOM', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom('Initial');

    bindToText(div, _atom, { debounceTime: 0 });

    t.is(div.textContent, 'Initial');

    const textBeforeRemove = div.textContent;
    div.remove();

    _atom.value = 'After remove';
    // autoDisconnect prevents updates after removal
    t.is(div.textContent, textBeforeRemove);

    window.close();
});

test('bindToText works with Text node directly', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const textNode = document.createTextNode('');
    document.body.append(textNode);

    const store = new Store();
    const _atom = atom('Text node content');

    bindToText(textNode, _atom, { debounceTime: 0 });

    t.is(textNode.textContent, 'Text node content');

    _atom.value = 'Updated';
    t.is(textNode.textContent, 'Updated');

    window.close();
});
