// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToSelectMultiple } from '../../../src/element-binders/two-way-bindings/multiple-select.js';
import { Store, collection } from '@supercat1337/store2';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

test('bindToSelectMultiple updates select options from _collection', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;

    const body = document.body;
    const select = document.createElement('select');
    select.multiple = true;
    for (let i = 0; i < 5; i++) {
        const option = document.createElement('option');
        option.value = String(i);
        select.appendChild(option);
    }
    body.append(select);

    const store = new Store();
    const _collection = collection(['1', '3']);

    bindToSelectMultiple(select, _collection, { debounceTime: 0 });

    t.deepEqual(getSelectedValues(select), ['1', '3']);

    _collection.value = ['0', '2', '4'];
    await sleep(50);

    t.deepEqual(getSelectedValues(select), ['0', '2', '4']);

    window.close();
});

test('bindToSelectMultiple updates collection when select changes', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const body = document.body;

    const select = document.createElement('select');
    select.multiple = true;
    for (let i = 0; i < 3; i++) {
        const option = document.createElement('option');
        option.value = String(i);
        select.appendChild(option);
    }
    body.append(select);

    const _collection = collection(['0']);
    bindToSelectMultiple(select, _collection, { debounceTime: 0 });

    // Изменяем коллекцию → обновляем select
    _collection.value = ['0', '2'];
    //await sleep(50);
    t.deepEqual(getSelectedValues(select), ['0', '2']);

    // Изменяем select → обновляем коллекцию
    select.options[0].selected = false;
    select.options[2].selected = false;
    select.options[1].selected = true;
    select.dispatchEvent(new window.Event('change', { bubbles: true }));
    //await sleep(50);
    t.deepEqual(_collection.value, ['1']);

    dom.window.close();
});

function getSelectedValues(selectElement) {
    const selected = [];
    for (let i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].selected) selected.push(selectElement.options[i].value);
    }
    return selected;
}

test('bindToSelectMultiple with custom event', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;

    const body = document.body;
    const select = document.createElement('select');
    select.multiple = true;
    const option = document.createElement('option');
    option.value = 'test';
    select.appendChild(option);
    body.append(select);

    const store = new Store();
    const _collection = collection([]);

    bindToSelectMultiple(select, _collection, { event: 'click' });

    select.options[0].selected = true;
    select.dispatchEvent(new window.Event('click'));
    await sleep(50);

    t.deepEqual(_collection.value, ['test']);

    window.close();
});

test('bindToSelectMultiple auto-disconnects when element is removed', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;

    const body = document.body;
    const select = document.createElement('select');
    select.multiple = true;
    const option = document.createElement('option');
    option.value = 'val';
    select.appendChild(option);
    body.append(select);

    const store = new Store();
    const _collection = collection(['val']);

    bindToSelectMultiple(select, _collection, { debounceTime: 0 });

    t.deepEqual(getSelectedValues(select), ['val']);

    const selectedBeforeRemove = getSelectedValues(select);
    select.remove();

    _collection.value = ['other'];
    await sleep(50);

    t.deepEqual(getSelectedValues(select), selectedBeforeRemove);

    window.close();
});
