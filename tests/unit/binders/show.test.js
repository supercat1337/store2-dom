// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToShow } from '../../../src/element-binders/show.js';
import { atom, Store } from '@supercat1337/store2';

test('bindToShow hides element when value is false (adds default "d-none" class)', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom(true);

    bindToShow(div, _atom, { debounceTime: 0 });

    t.false(div.classList.contains('d-none'));

    _atom.value = false;
    t.true(div.classList.contains('d-none'));

    _atom.value = true;
    t.false(div.classList.contains('d-none'));

    window.close();
});

test('bindToShow uses custom hideClassName', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom(true);

    bindToShow(div, _atom, { hideClassName: 'hidden', debounceTime: 0 });

    t.false(div.classList.contains('hidden'));

    _atom.value = false;
    t.true(div.classList.contains('hidden'));

    window.close();
});

test('bindToShow with invert: true (class added when value is true)', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom(true);

    bindToShow(div, _atom, { invert: true, hideClassName: 'invisible', debounceTime: 0 });

    t.true(div.classList.contains('invisible'));

    _atom.value = false;
    t.false(div.classList.contains('invisible'));

    window.close();
});

test('bindToShow auto-disconnects when element is removed from DOM', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom(true);

    bindToShow(div, _atom, { debounceTime: 0 });

    t.false(div.classList.contains('d-none'));

    const classNameBeforeRemove = div.className;
    div.remove();

    _atom.value = false;
    // autoDisconnect prevents adding the hide class after removal
    t.is(div.className, classNameBeforeRemove);

    window.close();
});
