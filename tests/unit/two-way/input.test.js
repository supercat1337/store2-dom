// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToInput } from '../../../src/element-binders/two-way-bindings/input-value.js';
import { atom, computed, sleep } from '@supercat1337/store2';

test('bindToInput updates input.value from atom (text)', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const input = document.createElement('input');
    input.type = 'text';
    document.body.append(input);
    const _atom = atom('hello');
    const unsub = bindToInput(input, _atom, { debounceTime: 0, lazy: false });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(input.value, 'hello');
    _atom.value = 'world';
    t.is(input.value, 'world');
});

test('bindToInput updates atom from input events (input event)', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const input = document.createElement('input');
    input.type = 'text';
    document.body.append(input);
    const _atom = atom('initial');
    const unsub = bindToInput(input, _atom, { debounceTime: 0, lazy: false });

    t.teardown(() => {
        unsub();
        window.close();
    });

    input.value = 'new value';
    input.dispatchEvent(new window.Event('input'));
    await sleep(10);
    t.is(_atom.value, 'new value');
});

test('bindToInput with lazy: true uses change event', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const input = document.createElement('input');
    input.type = 'text';
    document.body.append(input);
    const _atom = atom('initial');
    const unsub = bindToInput(input, _atom, { debounceTime: 0, lazy: true });

    t.teardown(() => {
        unsub();
        window.close();
    });

    input.value = 'updated';
    input.dispatchEvent(new window.Event('input'));
    await sleep(10);
    t.is(_atom.value, 'initial');
    input.dispatchEvent(new window.Event('change'));
    await sleep(10);
    t.is(_atom.value, 'updated');
});

test('bindToInput with type="number" converts values correctly', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const input = document.createElement('input');
    input.type = 'number';
    document.body.append(input);
    const _atom = atom(42);
    const unsub = bindToInput(input, _atom, { debounceTime: 0, lazy: true });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(input.value, '42');
    _atom.value = 100;
    t.is(input.value, '100');
    input.value = '55';
    input.dispatchEvent(new window.Event('change'));
    await sleep(10);
    t.is(_atom.value, 55);
    input.value = 'not a number';
    input.dispatchEvent(new window.Event('change'));
    await sleep(10);
    t.is(_atom.value, 0);
    t.is(input.value, '0');
});

test('bindToInput with custom event name', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const input = document.createElement('input');
    input.type = 'text';
    document.body.append(input);
    const _atom = atom('test');
    const unsub = bindToInput(input, _atom, { event: 'blur' });

    t.teardown(() => {
        unsub();
        window.close();
    });

    input.value = 'blur event';
    input.dispatchEvent(new window.Event('blur'));
    await sleep(10);
    t.is(_atom.value, 'blur event');
});

test('bindToInput auto-disconnects when element is removed', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const input = document.createElement('input');
    input.type = 'text';
    document.body.append(input);
    const _atom = atom('before');
    const unsub = bindToInput(input, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(input.value, 'before');
    const valueBeforeRemove = input.value;
    input.remove();
    _atom.value = 'after';
    t.is(input.value, valueBeforeRemove);
});

test('bindToInput respects debounceTime on user input', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const input = document.createElement('input');
    document.body.append(input);
    const a = atom('init');
    const unsub = bindToInput(input, a, { debounceTime: 100, lazy: false });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(input.value, 'init');
    input.value = 'new';
    input.dispatchEvent(new window.Event('input'));
    t.is(a.value, 'init');
    await sleep(150);
    t.is(a.value, 'new');
});

test('bindToInput with type="number" handles NaN value from atom when input already empty', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const input = document.createElement('input');
    input.type = 'number';
    input.value = ''; // изначально пустое поле
    document.body.append(input);
    const _atom = atom(123);
    const unsub = bindToInput(input, _atom, { debounceTime: 0, lazy: true });

    t.teardown(() => {
        unsub();
        window.close();
    });

    _atom.value = NaN;
    // поле остаётся пустым (не меняется)
    t.is(input.value, '');
    t.true(isNaN(_atom.value));
});

test('bindToInput throws error when not given Atom', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const input = document.createElement('input');
    input.type = 'text';
    document.body.append(input);
    const atomValue = atom(0);
    const computedValue = computed(() => atomValue.value);

    t.throws(
        () => {
            bindToInput(input, computedValue);
        },
        { message: /bindToInput expects an Atom/ }
    );
    window.close();
});
