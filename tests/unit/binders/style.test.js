// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToStyle } from '../../../src/element-binders/style.js';
import { atom, Store } from '@supercat1337/store2';

test('bindToStyle updates element.style.cssText with string value', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom('color: red; font-size: 16px;');

    bindToStyle(div, _atom, { debounceTime: 0 });

    t.is(div.style.cssText, 'color: red; font-size: 16px;');

    _atom.value = 'background: blue; padding: 10px;';
    t.is(div.style.cssText, 'background: blue; padding: 10px;');

    window.close();
});

test('bindToStyle updates element.style with object value', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom({ color: 'green', margin: '5px' });

    bindToStyle(div, _atom, { debounceTime: 0 });

    t.is(div.style.color, 'green');
    t.is(div.style.margin, '5px');

    _atom.value = { backgroundColor: 'yellow', padding: '20px' };
    t.is(div.style.backgroundColor, 'yellow');
    t.is(div.style.padding, '20px');
    // previous styles should be cleared
    t.is(div.style.color, '');
    t.is(div.style.margin, '');

    window.close();
});

test('bindToStyle auto-disconnects when element is removed from DOM', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom('color: red;');

    bindToStyle(div, _atom, { debounceTime: 0 });

    t.is(div.style.cssText, 'color: red;');

    const styleBeforeRemove = div.style.cssText;
    div.remove();

    _atom.value = 'color: blue;';
    // autoDisconnect prevents updates after removal
    t.is(div.style.cssText, styleBeforeRemove);

    window.close();
});
