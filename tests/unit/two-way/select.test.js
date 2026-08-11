// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToSelect } from '../../../src/element-binders/two-way-bindings/select.js';
import { atom, sleep } from '@supercat1337/store2';

test('bindToSelect updates select.value from atom', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const select = document.createElement('select');
    for (let i = 0; i < 3; i++) {
        const option = document.createElement('option');
        option.value = String(i);
        option.textContent = `Option ${i}`;
        select.appendChild(option);
    }
    document.body.append(select);
    const _atom = atom('1');
    const unsub = bindToSelect(select, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(select.value, '1');
    _atom.value = '2';
    t.is(select.value, '2');
});

test('bindToSelect updates atom when select changes', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const select = document.createElement('select');
    for (let i = 0; i < 3; i++) {
        const option = document.createElement('option');
        option.value = String(i);
        select.appendChild(option);
    }
    document.body.append(select);
    const _atom = atom('0');
    const unsub = bindToSelect(select, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    select.value = '1';
    select.dispatchEvent(new window.Event('change'));
    await sleep(10);
    t.is(_atom.value, '1');
});

test('bindToSelect with custom event', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const select = document.createElement('select');
    const option = document.createElement('option');
    option.value = 'test';
    select.appendChild(option);
    document.body.append(select);
    const _atom = atom('');
    const unsub = bindToSelect(select, _atom, { event: 'click' });

    t.teardown(() => {
        unsub();
        window.close();
    });

    select.value = 'test';
    select.dispatchEvent(new window.Event('click'));
    await sleep(10);
    t.is(_atom.value, 'test');
});

test('bindToSelect auto-disconnects when element is removed', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const select = document.createElement('select');
    const option = document.createElement('option');
    option.value = 'val';
    select.appendChild(option);
    document.body.append(select);
    const _atom = atom('val');
    const unsub = bindToSelect(select, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(select.value, 'val');
    const valueBeforeRemove = select.value;
    select.remove();
    _atom.value = 'other';
    t.is(select.value, valueBeforeRemove);
});

test('bindToSelect returns unsubscribe function that cleans up event listeners', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const select = document.createElement('select');
    const option = document.createElement('option');
    option.value = 'test';
    select.appendChild(option);
    document.body.append(select);
    const _atom = atom('test');
    const unsub = bindToSelect(select, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    unsub();
    _atom.value = 'other';
    t.is(select.value, 'test');
});
