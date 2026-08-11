// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToRadioGroup } from '../../../src/element-binders/two-way-bindings/radios.js';
import { atom } from '@supercat1337/store2';

test('bindToRadioGroup updates radio group from atom', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const radios = [];
    for (let i = 0; i < 5; i++) {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'group';
        radio.value = String(i);
        document.body.append(radio);
        radios.push(radio);
    }
    const _atom = atom('2');
    const unsub = bindToRadioGroup(radios, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.false(radios[0].checked);
    t.false(radios[1].checked);
    t.true(radios[2].checked);
    t.false(radios[3].checked);
    t.false(radios[4].checked);
    _atom.value = '4';
    t.false(radios[2].checked);
    t.true(radios[4].checked);
});

test('bindToRadioGroup updates atom when radio is clicked', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const radios = [];
    for (let i = 0; i < 3; i++) {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'group';
        radio.value = String(i);
        document.body.append(radio);
        radios.push(radio);
    }
    const _atom = atom('0');
    const unsub = bindToRadioGroup(radios, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.true(radios[0].checked);
    t.false(radios[1].checked);
    t.false(radios[2].checked);
    radios[1].click();
    t.false(radios[0].checked);
    t.true(radios[1].checked);
    t.false(radios[2].checked);
    t.is(_atom.value, '1');
    radios[2].click();
    t.false(radios[1].checked);
    t.true(radios[2].checked);
    t.is(_atom.value, '2');
});

test('bindToRadioGroup with custom event', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const radios = [];
    for (let i = 0; i < 2; i++) {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'group';
        radio.value = String(i);
        document.body.append(radio);
        radios.push(radio);
    }
    const _atom = atom('0');
    const unsub = bindToRadioGroup(radios, _atom, { event: 'click' });

    t.teardown(() => {
        unsub();
        window.close();
    });

    radios[1].click();
    t.is(_atom.value, '1');
});

test('bindToRadioGroup auto-disconnects when elements are removed', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const radios = [];
    for (let i = 0; i < 2; i++) {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'group';
        radio.value = String(i);
        document.body.append(radio);
        radios.push(radio);
    }
    const _atom = atom('0');
    const unsub = bindToRadioGroup(radios, _atom, { debounceTime: 0 });

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.true(radios[0].checked);
    radios.forEach(r => r.remove());
    _atom.value = '1';
    t.true(radios[0].checked);
    t.false(radios[1].checked);
});

test('bindToRadioGroup with empty array returns no-op unsubscribe', t => {
    const _atom = atom('test');
    const unsub = bindToRadioGroup([], _atom);
    t.is(typeof unsub, 'function');
    unsub();
    t.pass();
});

test('bindToRadioGroup with radios having no name returns no-op unsubscribe', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = '';
    document.body.append(radio);
    const _atom = atom('test');
    const unsub = bindToRadioGroup([radio], _atom);
    t.is(typeof unsub, 'function');
    unsub();
    window.close();
    t.pass();
});
