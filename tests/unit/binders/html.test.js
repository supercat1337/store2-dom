// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToHtml } from '../../../src/element-binders/html.js';
import { atom, Store } from '@supercat1337/store2';

test('bindToHtml updates element.innerHTML with reactive string', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom('<span class="test">Hello</span>');

    bindToHtml(div, _atom, { debounceTime: 0 });

    t.not(div.querySelector('.test'), null);
    t.is(div.querySelector('.test')?.textContent, 'Hello');

    _atom.value = '<strong>World</strong>';
    t.is(div.querySelector('strong')?.textContent, 'World');
    t.is(div.querySelector('.test'), null);

    window.close();
});

test('bindToHtml auto-disconnects when element is removed from DOM', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom('<p>Initial</p>');

    bindToHtml(div, _atom, { debounceTime: 0 });

    t.is(div.innerHTML, '<p>Initial</p>');

    const htmlBeforeRemove = div.innerHTML;
    div.remove();

    _atom.value = '<p>After remove</p>';
    // autoDisconnect prevents updates after removal
    t.is(div.innerHTML, htmlBeforeRemove);

    window.close();
});

test('bindToHtml with number value converts to string', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom(123);

    bindToHtml(div, _atom, { debounceTime: 0 });

    t.is(div.innerHTML, '123');

    window.close();
});
