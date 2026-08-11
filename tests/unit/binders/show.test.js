// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToShow } from '../../../src/element-binders/show.js';
import { atom } from '@supercat1337/store2';

test('bindToShow hides element when value is false (adds default "d-none" class)', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom(true);
    const unsub = bindToShow(div, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.false(div.classList.contains('d-none'));
    _atom.value = false;
    t.true(div.classList.contains('d-none'));
    _atom.value = true;
    t.false(div.classList.contains('d-none'));
});

test('bindToShow uses custom hideClassName', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom(true);
    const unsub = bindToShow(div, _atom, { hideClassName: 'hidden', debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.false(div.classList.contains('hidden'));
    _atom.value = false;
    t.true(div.classList.contains('hidden'));
});

test('bindToShow with invert: true (class added when value is true)', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom(true);
    const unsub = bindToShow(div, _atom, {
        invert: true,
        hideClassName: 'invisible',
        debounceTime: 0,
    });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.true(div.classList.contains('invisible'));
    _atom.value = false;
    t.false(div.classList.contains('invisible'));
});

test('bindToShow auto-disconnects when element is removed from DOM', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom(true);
    const unsub = bindToShow(div, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.false(div.classList.contains('d-none'));
    const classNameBeforeRemove = div.className;
    div.remove();
    _atom.value = false;
    t.is(div.className, classNameBeforeRemove);
});
