// tests/unit/binders/binder.test.js
import test from 'ava';
import { JSDOM } from 'jsdom';
import { binder } from '../../../src/element-binders/binder.js';
import { atom, sleep } from '@supercat1337/store2';

test('binder respects autoDisconnect and removes subscription when element removed', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const a = atom(0);
    let calls = 0;
    const setter = (item, el) => {
        calls++;
        el.textContent = item.value;
    };
    const unsub = binder(div, a, setter, {}, { autoDisconnect: true, debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(calls, 1);
    a.value = 1;
    t.is(calls, 2);
    div.remove();
    a.value = 2;
    t.is(calls, 2);
});

test('binder respects AbortSignal', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const a = atom(0);
    let calls = 0;
    const setter = (item, el) => {
        calls++;
        el.textContent = item.value;
    };
    const controller = new AbortController();
    const unsub = binder(div, a, setter, {}, { signal: controller.signal, debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(calls, 1);
    a.value = 1;
    t.is(calls, 2);
    controller.abort();
    a.value = 2;
    t.is(calls, 2);
});

test('binder respects debounceTime', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const a = atom(0);
    let calls = 0;
    const setter = (item, el) => {
        calls++;
        el.textContent = item.value;
    };
    const unsub = binder(div, a, setter, {}, { debounceTime: 50 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(calls, 1);
    a.value = 1;
    a.value = 2;
    t.is(calls, 1);
    await sleep(60);
    t.is(calls, 2);
});
