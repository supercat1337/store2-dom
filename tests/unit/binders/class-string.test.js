// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToClassString } from '../../../src/element-binders/className.js';
import { atom } from '@supercat1337/store2';

test('bindToClassString updates element.className with reactive string', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom('class_0');
    const unsub = bindToClassString(div, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(div.className, 'class_0');
    _atom.value = 'class_1';
    t.is(div.className, 'class_1');
});

test('bindToClassString auto-disconnects when element is removed from DOM', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom('initial');
    const unsub = bindToClassString(div, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(div.className, 'initial');
    const classNameBeforeRemove = div.className;
    div.remove();
    _atom.value = 'after-remove';
    t.is(div.className, classNameBeforeRemove);
});
