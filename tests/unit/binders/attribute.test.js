// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToAttribute } from '../../../src/element-binders/attribute.js';
import { atom } from '@supercat1337/store2';

test('bindToAttr', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom('test-value');
    const unsub = bindToAttribute(div, _atom, 'test', { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(div.getAttribute('test'), 'test-value');
    _atom.value = '123';
    t.is(div.getAttribute('test'), '123');
    const valueBeforeRemove = div.getAttribute('test');
    div.remove();
    _atom.value = '321';
    t.is(div.getAttribute('test'), valueBeforeRemove);
});

test('bindToAttr with null value', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = /** @type {import("@supercat1337/store2").Atom<string | null>} */ (
        atom('test-value')
    );
    const unsub = bindToAttribute(div, _atom, 'test', { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(div.getAttribute('test'), 'test-value');
    _atom.value = '123';
    t.is(div.getAttribute('test'), '123');
    _atom.value = null;
    t.false(div.hasAttribute('test'));
});

test('bindToAttribute ignores non-string non-null values', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const a = atom(123);
    const unsub = bindToAttribute(div, a, 'data-test', { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.false(div.hasAttribute('data-test'));
    a.value = null;
    t.false(div.hasAttribute('data-test'));
    a.value = 'hello';
    t.is(div.getAttribute('data-test'), 'hello');
});
