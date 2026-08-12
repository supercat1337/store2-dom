import test from 'ava';
import { JSDOM } from 'jsdom';
import { getElementById, getElement } from '../../../src/utils/getElement.js';

test('getElement with custom root searches only inside root', t => {
    const dom = new JSDOM(
        '<!DOCTYPE html><html><body><div id="outer"><div id="inner"></div></div></body></html>'
    );
    const window = dom.window;
    const document = window.document;
    const outer = document.getElementById('outer');
    const inner = getElement('#inner', window.HTMLDivElement, outer);
    t.is(inner.id, 'inner');
    t.throws(
        () => {
            getElement('#outer', window.HTMLDivElement, outer);
        },
        { message: /not found/ }
    );
    window.close();
});

test('getElementById with custom root', t => {
    const dom = new JSDOM(
        '<!DOCTYPE html><html><body><div id="outer"><div id="inner"></div></div></body></html>'
    );
    const window = dom.window;
    const document = window.document;
    const outer = document.getElementById('outer');
    const inner = getElementById('inner', window.HTMLDivElement, outer);
    t.is(inner.id, 'inner');
    t.throws(
        () => {
            getElementById('outer', window.HTMLDivElement, outer);
        },
        { message: /not found/ }
    );
    window.close();
});

test('getElement throws when type mismatches', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body><div id="test"></div></body></html>');
    const window = dom.window;
    const document = window.document;
    t.throws(
        () => {
            getElement('#test', window.HTMLSpanElement, document);
        },
        { message: /Element matching "#test" is not of type HTMLSpanElement/ }
    );
    window.close();
});

test('getElementById throws when type mismatches (message from getElement)', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body><div id="test"></div></body></html>');
    const window = dom.window;
    const document = window.document;
    t.throws(
        () => {
            getElementById('test', window.HTMLSpanElement, document);
        },
        { message: /Element matching "#test" is not of type HTMLSpanElement/ }
    );
    window.close();
});

test('getElement with root throws when type mismatches', t => {
    const dom = new JSDOM(
        '<!DOCTYPE html><html><body><div id="outer"><div id="inner"></div></div></body></html>'
    );
    const window = dom.window;
    const document = window.document;
    const outer = document.getElementById('outer');
    t.throws(
        () => {
            getElement('#inner', window.HTMLSpanElement, outer);
        },
        { message: /Element matching "#inner" is not of type HTMLSpanElement/ }
    );
    window.close();
});

test('getElementById with root throws when type mismatches', t => {
    const dom = new JSDOM(
        '<!DOCTYPE html><html><body><div id="outer"><div id="inner"></div></div></body></html>'
    );
    const window = dom.window;
    const document = window.document;
    const outer = document.getElementById('outer');
    t.throws(
        () => {
            getElementById('inner', window.HTMLSpanElement, outer);
        },
        { message: /Element matching "#inner" is not of type HTMLSpanElement/ }
    );
    window.close();
});

// Убеждаемся, что при правильном типе ошибка не выбрасывается
test('getElement does not throw when type matches', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body><div id="test"></div></body></html>');
    const window = dom.window;
    const document = window.document;
    t.notThrows(() => {
        getElement('#test', window.HTMLDivElement, document);
    });
    window.close();
});

test('getElementById does not throw when type matches', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body><div id="test"></div></body></html>');
    const window = dom.window;
    const document = window.document;
    t.notThrows(() => {
        getElementById('test', window.HTMLDivElement, document);
    });
    window.close();
});
