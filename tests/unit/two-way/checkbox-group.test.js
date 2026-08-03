// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToCheckboxGroup } from '../../../src/element-binders/checkboxes-values.js';
import { collection, Store } from '@supercat1337/store2';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test('bindToCheckboxGroup updates checkbox group from _collection', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;

    const body = document.body;
    const checkboxes = [];
    for (let i = 0; i < 5; i++) {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = String(i);
        body.append(cb);
        checkboxes.push(cb);
    }

    const store = new Store();
    const _collection = collection(['1', '3']);

    bindToCheckboxGroup(checkboxes, _collection, { debounceTime: 0 });

    t.false(checkboxes[0].checked);
    t.true(checkboxes[1].checked);
    t.false(checkboxes[2].checked);
    t.true(checkboxes[3].checked);
    t.false(checkboxes[4].checked);

    _collection.value = ['0', '2', '4'];
    t.true(checkboxes[0].checked);
    t.false(checkboxes[1].checked);
    t.true(checkboxes[2].checked);
    t.false(checkboxes[3].checked);
    t.true(checkboxes[4].checked);

    window.close();
});

test('bindToCheckboxGroup updates _collection when checkboxes are clicked', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const body = document.body;

    const checkboxes = [];
    for (let i = 0; i < 3; i++) {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = String(i);
        cb.checked = false;
        body.append(cb);
        checkboxes.push(cb);
    }

    const _collection = collection([]);
    bindToCheckboxGroup(checkboxes, _collection, { debounceTime: 0 });

    // Включаем чекбоксы 0 и 2
    checkboxes[0].checked = true;
    checkboxes[0].dispatchEvent(new window.Event('change', { bubbles: true }));
    checkboxes[2].checked = true;
    checkboxes[2].dispatchEvent(new window.Event('change', { bubbles: true }));
    //await sleep(50);
    t.deepEqual(_collection.value, ['0', '2']);
    t.true(checkboxes[0].checked);
    t.true(checkboxes[2].checked);

    // Выключаем чекбокс 2
    checkboxes[2].checked = false;
    checkboxes[2].dispatchEvent(new window.Event('change', { bubbles: true }));
    //await sleep(50);
    t.deepEqual(_collection.value, ['0']);
    t.false(checkboxes[2].checked);

    dom.window.close();
});

test('bindToCheckboxGroup with custom event', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;

    const body = document.body;
    const checkboxes = [];
    for (let i = 0; i < 2; i++) {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = String(i);
        body.append(cb);
        checkboxes.push(cb);
    }

    const store = new Store();
    const _collection = collection([]);

    bindToCheckboxGroup(checkboxes, _collection, { event: 'click' });

    checkboxes[0].click();
    t.deepEqual(_collection.value, ['0']);

    window.close();
});

test('bindToCheckboxGroup auto-disconnects when elements are removed', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;

    const body = document.body;
    const checkboxes = [];
    for (let i = 0; i < 2; i++) {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = String(i);
        body.append(cb);
        checkboxes.push(cb);
    }

    const store = new Store();
    const _collection = collection(['0']);

    bindToCheckboxGroup(checkboxes, _collection, { debounceTime: 0 });

    t.true(checkboxes[0].checked);
    t.false(checkboxes[1].checked);

    // Remove all checkboxes
    checkboxes.forEach(cb => cb.remove());
    _collection.value = ['1'];

    // autoDisconnect should prevent updates
    t.true(checkboxes[0].checked);
    t.false(checkboxes[1].checked);

    window.close();
});

test('bindToCheckboxGroup with empty array returns no-op unsubscribe', t => {
    const store = new Store();
    const _collection = collection([]);
    const unsub = bindToCheckboxGroup([], _collection);
    t.is(typeof unsub, 'function');
    unsub(); // should not throw
    t.pass();
});
