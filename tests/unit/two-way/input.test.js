// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToInput } from '../../../src/element-binders/two-way-bindings/input-value.js';
import { atom, Store } from '@supercat1337/store2';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test('bindToInput updates input.value from atom (text)', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;

    const body = document.body;
    const input = document.createElement('input');
    input.type = 'text';
    body.append(input);

    const store = new Store();
    const _atom = atom('hello');

    bindToInput(input, _atom, { debounceTime: 0, lazy: false });

    t.is(input.value, 'hello');

    _atom.value = 'world';
    t.is(input.value, 'world');

    window.close();
});

test('bindToInput updates atom from input events (input event)', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;

    const body = document.body;
    const input = document.createElement('input');
    input.type = 'text';
    body.append(input);

    const store = new Store();
    const _atom = atom('initial');

    bindToInput(input, _atom, { debounceTime: 0, lazy: false });

    input.value = 'new value';
    input.dispatchEvent(new window.Event('input'));
    await sleep(10);

    t.is(_atom.value, 'new value');

    window.close();
});

test('bindToInput with lazy: true uses change event', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;

    const body = document.body;
    const input = document.createElement('input');
    input.type = 'text';
    body.append(input);

    const store = new Store();
    const _atom = atom('initial');

    bindToInput(input, _atom, { debounceTime: 0, lazy: true });

    input.value = 'updated';
    input.dispatchEvent(new window.Event('input'));
    await sleep(10);

    t.is(_atom.value, 'initial'); // not updated on input

    input.dispatchEvent(new window.Event('change'));
    await sleep(10);
    t.is(_atom.value, 'updated');

    window.close();
});

test('bindToInput with type="number" converts values correctly', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;

    const body = document.body;
    const input = document.createElement('input');
    input.type = 'number';
    body.append(input);

    const store = new Store();
    const _atom = atom(42);

    bindToInput(input, _atom, { debounceTime: 0, lazy: true });

    t.is(input.value, '42');

    _atom.value = 100;
    t.is(input.value, '100');

    input.value = '55';
    input.dispatchEvent(new window.Event('change'));
    await sleep(10);
    t.is(_atom.value, 55);

    // Invalid number should become 0
    input.value = 'not a number';
    input.dispatchEvent(new window.Event('change'));
    await sleep(10);
    t.is(_atom.value, 0);
    t.is(input.value, '0');

    window.close();
});

test('bindToInput with custom event name', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;

    const body = document.body;
    const input = document.createElement('input');
    input.type = 'text';
    body.append(input);

    const store = new Store();
    const _atom = atom('test');

    bindToInput(input, _atom, { event: 'blur' });

    input.value = 'blur event';
    input.dispatchEvent(new window.Event('blur'));
    await sleep(10);
    t.is(_atom.value, 'blur event');

    window.close();
});

test('bindToInput auto-disconnects when element is removed', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;

    const body = document.body;
    const input = document.createElement('input');
    input.type = 'text';
    body.append(input);

    const store = new Store();
    const _atom = atom('before');

    bindToInput(input, _atom, { debounceTime: 0 });

    t.is(input.value, 'before');

    const valueBeforeRemove = input.value;
    input.remove();

    _atom.value = 'after';
    t.is(input.value, valueBeforeRemove);

    window.close();
});

test('bindToInput with type="number" handles empty string', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;

    const body = document.body;
    const input = document.createElement('input');
    input.type = 'number';
    body.append(input);

    const store = new Store();
    const _atom = atom(123);

    bindToInput(input, _atom, { debounceTime: 0, lazy: true });

    input.value = '';
    input.dispatchEvent(new window.Event('change'));
    await sleep(10);
    t.is(_atom.value, 0);
    t.is(input.value, '0');

    window.close();
});

test('bindToInput with type="number" handles non-numeric input', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;

    const body = document.body;
    const input = document.createElement('input');
    input.type = 'number';
    body.append(input);

    const store = new Store();
    const _atom = atom(5);

    bindToInput(input, _atom, { debounceTime: 0, lazy: true });

    input.value = 'abc';
    input.dispatchEvent(new window.Event('change'));
    await sleep(10);
    t.is(_atom.value, 0);
    t.is(input.value, '0');

    window.close();
});

test('bindToInput with type="number" handles NaN value from atom', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;

    const body = document.body;
    const input = document.createElement('input');
    input.type = 'number';
    input.value = '123';
    body.append(input);

    const store = new Store();
    const _atom = atom(123);

    bindToInput(input, _atom, { debounceTime: 0, lazy: true });

    // Set atom to NaN
    _atom.value = NaN;

    t.is(input.value, '');
    t.true(isNaN(_atom.value));

    window.close();
});
