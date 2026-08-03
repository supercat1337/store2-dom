// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToCssClass } from '../../../src/element-binders/css-class.js';
import { atom, Store } from '@supercat1337/store2';

test('bindToCssClass adds class when value is true (invert: false default)', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom(true);

    bindToCssClass(div, _atom, 'test-class', { debounceTime: 0 });

    t.true(div.classList.contains('test-class'));

    _atom.value = false;
    t.false(div.classList.contains('test-class'));

    _atom.value = true;
    t.true(div.classList.contains('test-class'));

    window.close();
});

test('bindToCssClass with invert: true adds class when value is false', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom(true);

    bindToCssClass(div, _atom, 'test-class', { debounceTime: 0, invert: true });

    t.false(div.classList.contains('test-class'));

    _atom.value = false;
    t.true(div.classList.contains('test-class'));

    _atom.value = true;
    t.false(div.classList.contains('test-class'));

    window.close();
});

test('bindToCssClass auto-disconnects when element is removed from DOM', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom(true);

    bindToCssClass(div, _atom, 'test-class', { debounceTime: 0 });

    t.true(div.classList.contains('test-class'));

    div.remove();
    _atom.value = false;

    // After removal, autoDisconnect prevents class removal
    t.true(div.classList.contains('test-class'));

    window.close();
});
