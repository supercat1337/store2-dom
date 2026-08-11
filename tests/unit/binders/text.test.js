// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToText } from '../../../src/element-binders/text.js';
import { atom } from '@supercat1337/store2';

test('bindToText updates element.textContent with reactive string/number', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom('Hello');
    const unsub = bindToText(div, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(div.textContent, 'Hello');
    _atom.value = 'World';
    t.is(div.textContent, 'World');
    _atom.value = 123;
    t.is(div.textContent, '123');
});

test('bindToText auto-disconnects when element is removed from DOM', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom('Initial');
    const unsub = bindToText(div, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(div.textContent, 'Initial');
    const textBeforeRemove = div.textContent;
    div.remove();
    _atom.value = 'After remove';
    t.is(div.textContent, textBeforeRemove);
});

test('bindToText works with Text node directly', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const textNode = document.createTextNode('');
    document.body.append(textNode);
    const _atom = atom('Text node content');
    const unsub = bindToText(textNode, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(textNode.textContent, 'Text node content');
    _atom.value = 'Updated';
    t.is(textNode.textContent, 'Updated');
});

test('bindToText with AbortSignal', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const a = atom('start');
    const controller = new AbortController();
    const unsub = bindToText(div, a, { signal: controller.signal, debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(div.textContent, 'start');
    a.value = 'updated';
    t.is(div.textContent, 'updated');
    controller.abort();
    a.value = 'after abort';
    t.is(div.textContent, 'updated');
});
