// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToStyle } from '../../../src/element-binders/style.js';
import { atom } from '@supercat1337/store2';

test('bindToStyle updates element.style.cssText with string value', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom('color: red; font-size: 16px;');
    const unsub = bindToStyle(div, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(div.style.cssText, 'color: red; font-size: 16px;');
    _atom.value = 'background: blue; padding: 10px;';
    t.is(div.style.cssText, 'background: blue; padding: 10px;');
});

test('bindToStyle updates element.style with object value', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom({ color: 'green', margin: '5px' });
    const unsub = bindToStyle(div, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(div.style.color, 'green');
    t.is(div.style.margin, '5px');
    _atom.value = { backgroundColor: 'yellow', padding: '20px' };
    t.is(div.style.backgroundColor, 'yellow');
    t.is(div.style.padding, '20px');
    t.is(div.style.color, '');
    t.is(div.style.margin, '');
});

test('bindToStyle clears previous inline styles when object updates', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const a = atom({ color: 'red', margin: '10px' });
    const unsub = bindToStyle(div, a, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(div.style.color, 'red');
    t.is(div.style.margin, '10px');
    a.value = { background: 'blue' };
    t.is(div.style.color, '');
    t.is(div.style.margin, '');
    t.is(div.style.background, 'blue');
});

test('bindToStyle auto-disconnects when element is removed from DOM', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom('color: red;');
    const unsub = bindToStyle(div, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(div.style.cssText, 'color: red;');
    const styleBeforeRemove = div.style.cssText;
    div.remove();
    _atom.value = 'color: blue;';
    t.is(div.style.cssText, styleBeforeRemove);
});
