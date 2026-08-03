// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToClassString } from '../../../src/element-binders/className.js';
import { atom, Store } from '@supercat1337/store2';

test('bindToClassString updates element.className with reactive string', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom('class_0');

    bindToClassString(div, _atom, { debounceTime: 0 });

    t.is(div.className, 'class_0');

    _atom.value = 'class_1';
    t.is(div.className, 'class_1');

    window.close();
});

test('bindToClassString auto-disconnects when element is removed from DOM', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom('initial');

    bindToClassString(div, _atom, { debounceTime: 0 });

    t.is(div.className, 'initial');

    const classNameBeforeRemove = div.className;
    div.remove();

    _atom.value = 'after-remove';
    // autoDisconnect should prevent updates after removal
    t.is(div.className, classNameBeforeRemove);

    window.close();
});
