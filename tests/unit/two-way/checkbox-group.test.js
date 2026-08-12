// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToCheckboxGroup } from '../../../src/element-binders/checkboxes-values.js';
import { atom, collection } from '@supercat1337/store2';

test('bindToCheckboxGroup updates checkbox group from collection', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const checkboxes = [];
    for (let i = 0; i < 5; i++) {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = String(i);
        document.body.append(cb);
        checkboxes.push(cb);
    }
    const _collection = collection(['1', '3']);
    const unsub = bindToCheckboxGroup(checkboxes, _collection, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

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
});

test('bindToCheckboxGroup updates collection when checkboxes are clicked', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const checkboxes = [];
    for (let i = 0; i < 3; i++) {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = String(i);
        cb.checked = false;
        document.body.append(cb);
        checkboxes.push(cb);
    }
    const _collection = collection([]);
    const unsub = bindToCheckboxGroup(checkboxes, _collection, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    checkboxes[0].checked = true;
    checkboxes[0].dispatchEvent(new window.Event('change', { bubbles: true }));
    checkboxes[2].checked = true;
    checkboxes[2].dispatchEvent(new window.Event('change', { bubbles: true }));
    t.deepEqual(_collection.value, ['0', '2']);
    t.true(checkboxes[0].checked);
    t.true(checkboxes[2].checked);
    checkboxes[2].checked = false;
    checkboxes[2].dispatchEvent(new window.Event('change', { bubbles: true }));
    t.deepEqual(_collection.value, ['0']);
    t.false(checkboxes[2].checked);
});

test('bindToCheckboxGroup with custom event', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const checkboxes = [];
    for (let i = 0; i < 2; i++) {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = String(i);
        document.body.append(cb);
        checkboxes.push(cb);
    }
    const _collection = collection([]);
    const unsub = bindToCheckboxGroup(checkboxes, _collection, { event: 'click' });

    t.teardown(() => {
        unsub();
        window.close();
    });

    checkboxes[0].click();
    t.deepEqual(_collection.value, ['0']);
});

test('bindToCheckboxGroup auto-disconnects when elements are removed', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const checkboxes = [];
    for (let i = 0; i < 2; i++) {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = String(i);
        document.body.append(cb);
        checkboxes.push(cb);
    }
    const _collection = collection(['0']);
    const unsub = bindToCheckboxGroup(checkboxes, _collection, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.true(checkboxes[0].checked);
    t.false(checkboxes[1].checked);
    checkboxes.forEach(cb => cb.remove());
    _collection.value = ['1'];
    t.true(checkboxes[0].checked);
    t.false(checkboxes[1].checked);
});

test('bindToCheckboxGroup with empty array returns no-op unsubscribe', t => {
    const _collection = collection([]);
    const unsub = bindToCheckboxGroup([], _collection);
    t.is(typeof unsub, 'function');
    unsub();
    t.pass();
});

test('bindToCheckboxGroup throws error when not given Collection', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const checkboxes = [];
    for (let i = 0; i < 2; i++) {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = String(i);
        document.body.append(cb);
        checkboxes.push(cb);
    }
    const atomValue = atom('not collection');
    t.throws(
        () => {
            bindToCheckboxGroup(checkboxes, atomValue);
        },
        { message: /bindToCheckboxGroup expects a Collection/ }
    );
    window.close();
});
