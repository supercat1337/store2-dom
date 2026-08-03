// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToDataset } from '../../../src/element-binders/dataset.js';
import { atom, Store } from '@supercat1337/store2';

test('bindToDataset updates data-* attributes from object', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom({ id: '123', role: 'admin' });

    bindToDataset(div, _atom, { debounceTime: 0 });

    t.is(div.dataset.id, '123');
    t.is(div.dataset.role, 'admin');

    window.close();
});

test('bindToDataset replaces entire dataset on update', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom({ a: '1', b: '2' });

    bindToDataset(div, _atom, { debounceTime: 0 });

    t.is(div.dataset.a, '1');
    t.is(div.dataset.b, '2');

    _atom.value = { c: '3' };

    t.is(div.dataset.a, undefined);
    t.is(div.dataset.b, undefined);
    t.is(div.dataset.c, '3');

    window.close();
});

test('bindToDataset removes all data-* attributes when value is null', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom({ test: 'value' });

    bindToDataset(div, _atom, { debounceTime: 0 });

    t.true(div.hasAttribute('data-test'));

    _atom.value = null;

    t.false(div.hasAttribute('data-test'));
    t.is(Object.keys(div.dataset).length, 0);

    window.close();
});

test('bindToDataset auto-disconnects when element is removed from DOM', t => {
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const window = dom.window;
const document = window.document;

    const body = document.body;
    const div = document.createElement('div');
    body.append(div);

    const store = new Store();
    const _atom = atom({ id: '123' });

    bindToDataset(div, _atom, { debounceTime: 0 });

    t.is(div.dataset.id, '123');

    // Store dataset as plain object before removal
    const datasetBeforeRemove = Object.assign({}, div.dataset);
    div.remove();

    _atom.value = { id: '456' };

    // autoDisconnect prevents updates after removal
    t.deepEqual(Object.assign({}, div.dataset), datasetBeforeRemove);

    window.close();
});
