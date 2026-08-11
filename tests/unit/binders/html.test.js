// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToHtml } from '../../../src/element-binders/html.js';
import { atom } from '@supercat1337/store2';

test('bindToHtml updates element.innerHTML with reactive string', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom('<span class="test">Hello</span>');
    const unsub = bindToHtml(div, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.not(div.querySelector('.test'), null);
    t.is(div.querySelector('.test')?.textContent, 'Hello');
    _atom.value = '<strong>World</strong>';
    t.is(div.querySelector('strong')?.textContent, 'World');
    t.is(div.querySelector('.test'), null);
});

test('bindToHtml auto-disconnects when element is removed from DOM', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom('<p>Initial</p>');
    const unsub = bindToHtml(div, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(div.innerHTML, '<p>Initial</p>');
    const htmlBeforeRemove = div.innerHTML;
    div.remove();
    _atom.value = '<p>After remove</p>';
    t.is(div.innerHTML, htmlBeforeRemove);
});

test('bindToHtml with number value converts to string', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom(123);
    const unsub = bindToHtml(div, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(div.innerHTML, '123');
});
