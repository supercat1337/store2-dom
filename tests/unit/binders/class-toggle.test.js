// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToCssClass } from '../../../src/element-binders/css-class.js';
import { atom } from '@supercat1337/store2';

test('bindToCssClass adds class when value is true (invert: false default)', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom(true);
    const unsub = bindToCssClass(div, _atom, 'test-class', { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.true(div.classList.contains('test-class'));
    _atom.value = false;
    t.false(div.classList.contains('test-class'));
    _atom.value = true;
    t.true(div.classList.contains('test-class'));
});

test('bindToCssClass with invert: true adds class when value is false', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom(true);
    const unsub = bindToCssClass(div, _atom, 'test-class', { debounceTime: 0, invert: true });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.false(div.classList.contains('test-class'));
    _atom.value = false;
    t.true(div.classList.contains('test-class'));
    _atom.value = true;
    t.false(div.classList.contains('test-class'));
});

test('bindToCssClass auto-disconnects when element is removed from DOM', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom(true);
    const unsub = bindToCssClass(div, _atom, 'test-class', { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.true(div.classList.contains('test-class'));
    div.remove();
    _atom.value = false;
    t.true(div.classList.contains('test-class'));
});
