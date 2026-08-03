// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToSelect } from '../../../src/element-binders/two-way-bindings/select.js';
import { atom, Store } from '@supercat1337/store2';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test('bindToSelect updates select.value from atom', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const select = document.createElement('select');
    for (let i = 0; i < 3; i++) {
        const option = document.createElement('option');
        option.value = String(i);
        option.textContent = `Option ${i}`;
        select.appendChild(option);
    }
    body.append(select);

    const store = new Store();
    const _atom = atom('1');

    bindToSelect(select, _atom, { debounceTime: 0 });

    t.is(select.value, '1');

    _atom.value = '2';
    t.is(select.value, '2');

    window.close();
});

test('bindToSelect updates atom when select changes', async t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const select = document.createElement('select');
    for (let i = 0; i < 3; i++) {
        const option = document.createElement('option');
        option.value = String(i);
        select.appendChild(option);
    }
    body.append(select);

    const store = new Store();
    const _atom = atom('0');

    bindToSelect(select, _atom, { debounceTime: 0 });

    select.value = '1';
    select.dispatchEvent(new window.Event('change'));
    await sleep(10);
    t.is(_atom.value, '1');

    window.close();
});

test('bindToSelect with custom event', async t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const select = document.createElement('select');
    const option = document.createElement('option');
    option.value = 'test';
    select.appendChild(option);
    body.append(select);

    const store = new Store();
    const _atom = atom('');

    bindToSelect(select, _atom, { event: 'click' });

    select.value = 'test';
    select.dispatchEvent(new window.Event('click'));
    await sleep(10);
    t.is(_atom.value, 'test');

    window.close();
});

test('bindToSelect auto-disconnects when element is removed', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const select = document.createElement('select');
    const option = document.createElement('option');
    option.value = 'val';
    select.appendChild(option);
    body.append(select);

    const store = new Store();
    const _atom = atom('val');

    bindToSelect(select, _atom, { debounceTime: 0 });

    t.is(select.value, 'val');

    const valueBeforeRemove = select.value;
    select.remove();

    _atom.value = 'other';
    t.is(select.value, valueBeforeRemove);

    window.close();
});

test('bindToSelect updates select when atom changes after subscription', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const select = document.createElement('select');
    const option1 = document.createElement('option');
    option1.value = 'a';
    const option2 = document.createElement('option');
    option2.value = 'b';
    select.appendChild(option1);
    select.appendChild(option2);
    body.append(select);

    const store = new Store();
    const _atom = atom('a');

    bindToSelect(select, _atom, { debounceTime: 0 });

    t.is(select.value, 'a');

    _atom.value = 'b';
    t.is(select.value, 'b');

    window.close();
});

test('bindToSelect returns unsubscribe function that cleans up event listeners', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const select = document.createElement('select');
    const option = document.createElement('option');
    option.value = 'test';
    select.appendChild(option);
    body.append(select);

    const store = new Store();
    const _atom = atom('test');

    const unsubscribe = bindToSelect(select, _atom, { debounceTime: 0 });

    // Call unsubscribe to clean up
    unsubscribe();

    // After cleanup, changing atom should not affect select
    _atom.value = 'other';
    t.is(select.value, 'test'); // still old value because listener removed

    window.close();
});
