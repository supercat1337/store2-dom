// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToDataset } from '../../../src/element-binders/dataset.js';
import { atom } from '@supercat1337/store2';

test('bindToDataset updates data-* attributes from object', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom({ id: '123', role: 'admin' });
    const unsub = bindToDataset(div, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(div.dataset.id, '123');
    t.is(div.dataset.role, 'admin');
});

test('bindToDataset replaces entire dataset on update', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom({ a: '1', b: '2' });
    const unsub = bindToDataset(div, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(div.dataset.a, '1');
    t.is(div.dataset.b, '2');
    _atom.value = { c: '3' };
    t.is(div.dataset.a, undefined);
    t.is(div.dataset.b, undefined);
    t.is(div.dataset.c, '3');
});

test('bindToDataset removes all data-* attributes when value is null', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom({ test: 'value' });
    const unsub = bindToDataset(div, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.true(div.hasAttribute('data-test'));
    _atom.value = null;
    t.false(div.hasAttribute('data-test'));
    t.is(Object.keys(div.dataset).length, 0);
});

test('bindToDataset removes attributes not present in new object', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const a = atom({ x: '1', y: '2' });
    const unsub = bindToDataset(div, a, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(div.dataset.x, '1');
    t.is(div.dataset.y, '2');
    a.value = { x: '3' };
    t.is(div.dataset.x, '3');
    t.false(div.hasAttribute('data-y'));
});

test('bindToDataset auto-disconnects when element is removed from DOM', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const _atom = atom({ id: '123' });
    const unsub = bindToDataset(div, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(div.dataset.id, '123');
    const datasetBeforeRemove = Object.assign({}, div.dataset);
    div.remove();
    _atom.value = { id: '456' };
    t.deepEqual(Object.assign({}, div.dataset), datasetBeforeRemove);
});
