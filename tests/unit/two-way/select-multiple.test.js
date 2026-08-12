// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToSelectMultiple } from '../../../src/element-binders/two-way-bindings/multiple-select.js';
import { atom, collection, sleep } from '@supercat1337/store2';

function getSelectedValues(selectElement) {
    const selected = [];
    for (let i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].selected) selected.push(selectElement.options[i].value);
    }
    return selected;
}

test('bindToSelectMultiple updates select options from collection', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const select = document.createElement('select');
    select.multiple = true;
    for (let i = 0; i < 5; i++) {
        const option = document.createElement('option');
        option.value = String(i);
        select.appendChild(option);
    }
    document.body.append(select);
    const _collection = collection(['1', '3']);
    const unsub = bindToSelectMultiple(select, _collection, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.deepEqual(getSelectedValues(select), ['1', '3']);
    _collection.value = ['0', '2', '4'];
    await sleep(50);
    t.deepEqual(getSelectedValues(select), ['0', '2', '4']);
});

test('bindToSelectMultiple updates collection when select changes', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const select = document.createElement('select');
    select.multiple = true;
    for (let i = 0; i < 3; i++) {
        const option = document.createElement('option');
        option.value = String(i);
        select.appendChild(option);
    }
    document.body.append(select);
    const _collection = collection(['0']);
    const unsub = bindToSelectMultiple(select, _collection, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    _collection.value = ['0', '2'];
    t.deepEqual(getSelectedValues(select), ['0', '2']);
    select.options[0].selected = false;
    select.options[2].selected = false;
    select.options[1].selected = true;
    select.dispatchEvent(new window.Event('change', { bubbles: true }));
    await sleep(10);
    t.deepEqual(_collection.value, ['1']);
});

test('bindToSelectMultiple with custom event', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const select = document.createElement('select');
    select.multiple = true;
    const option = document.createElement('option');
    option.value = 'test';
    select.appendChild(option);
    document.body.append(select);
    const _collection = collection([]);
    const unsub = bindToSelectMultiple(select, _collection, { event: 'click' });

    t.teardown(() => {
        unsub();
        window.close();
    });

    select.options[0].selected = true;
    select.dispatchEvent(new window.Event('click'));
    await sleep(50);
    t.deepEqual(_collection.value, ['test']);
});

test('bindToSelectMultiple auto-disconnects when element is removed', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const select = document.createElement('select');
    select.multiple = true;
    const option = document.createElement('option');
    option.value = 'val';
    select.appendChild(option);
    document.body.append(select);
    const _collection = collection(['val']);
    const unsub = bindToSelectMultiple(select, _collection, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.deepEqual(getSelectedValues(select), ['val']);
    const selectedBeforeRemove = getSelectedValues(select);
    select.remove();
    _collection.value = ['other'];
    await sleep(50);
    t.deepEqual(getSelectedValues(select), selectedBeforeRemove);
});

test('bindToSelectMultiple throws error when not given Collection', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const select = document.createElement('select');
    select.multiple = true;
    const option = document.createElement('option');
    option.value = 'test';
    select.appendChild(option);
    document.body.append(select);
    const atomValue = atom('not collection');
    t.throws(
        () => {
            bindToSelectMultiple(select, atomValue);
        },
        { message: /bindToSelectMultiple expects a Collection/ }
    );
    window.close();
});
