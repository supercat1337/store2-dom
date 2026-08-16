// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToList, ListItemHelper, ListItemUpdateContext, getDiffs } from '../../../src/index.js';
import { collection, sleep } from '@supercat1337/store2';

// Helper to create a template element in the document
function createTemplate(html, document) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template;
}

test('bindToList with custom createItem', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    document.body.append(container);
    const _collection = collection(['1', '2', '3']);

    const unsub = bindToList(
        container,
        _collection,
        (listItemHelper, details) => {
            const diffs = listItemHelper.getDiffs(
                { value: details.value },
                { value: details.oldValue }
            );
            if (diffs.value) {
                details.itemElement.textContent = details.value;
            }
        },
        {
            createItem: () => document.createElement('span'),
            debounceTime: 0,
        }
    );

    t.teardown(() => {
        unsub();
        window.close();
    });

    await sleep(10);
    t.is(container.querySelectorAll('span').length, 3);
    _collection.value = ['1', '2'];
    await sleep(10);
    t.is(container.querySelectorAll('span').length, 2);
});

test('bindToList with template (HTMLElement)', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    document.body.append(container);

    const template = document.createElement('span');
    template.className = 'item';
    template.textContent = 'template';

    const _collection = collection(['a', 'b', 'c']);
    const unsub = bindToList(
        container,
        _collection,
        (listItemHelper, details) => {
            details.itemElement.textContent = details.value;
        },
        {
            template: template,
            debounceTime: 0,
        }
    );

    t.teardown(() => {
        unsub();
        window.close();
    });

    await sleep(10);
    t.is(container.querySelectorAll('.item').length, 3);
    t.is(container.querySelectorAll('.item')[0].textContent, 'a');
    t.is(container.querySelectorAll('.item')[2].textContent, 'c');
    _collection.value = ['b', 'c'];
    await sleep(10);
    t.is(container.querySelectorAll('.item').length, 2);
    t.is(container.querySelectorAll('.item')[0].textContent, 'b');
    _collection.value = ['updated', 'c'];
    await sleep(10);
    t.is(container.querySelectorAll('.item')[0].textContent, 'updated');
    _collection.value = ['x', 'y', 'z', 'w', 'v'];
    await sleep(10);
    t.is(container.querySelectorAll('.item').length, 5);
    t.is(container.querySelectorAll('.item')[4].textContent, 'v');
});

test('bindToList with template (using <template> element)', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    document.body.append(container);

    const template = createTemplate('<span class="item"></span>', document);

    const _collection = collection(['a', 'b', 'c']);
    const unsub = bindToList(
        container,
        _collection,
        (listItemHelper, details) => {
            details.itemElement.textContent = details.value;
        },
        {
            template: template,
            debounceTime: 0,
        }
    );

    t.teardown(() => {
        unsub();
        window.close();
    });

    await sleep(10);
    t.is(container.querySelectorAll('.item').length, 3);
    t.is(container.querySelectorAll('.item')[0].textContent, 'a');
});

test('bindToList with object items and getDiffs', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    document.body.append(container);

    const template = createTemplate(
        '<p><span class="a"></span> - <span class="b"></span></p>',
        document
    );

    const _collection = collection([
        { a: '1', b: 'text-1' },
        { a: '2', b: 'text-2' },
        { a: '3', b: 'text-3' },
    ]);
    const unsub = bindToList(
        container,
        _collection,
        (listItemHelper, details) => {
            const aSpan = details.itemElement.querySelector('.a');
            const bSpan = details.itemElement.querySelector('.b');
            const diffs = getDiffs(details.value, details.oldValue);
            if (diffs.a) aSpan.textContent = details.value.a;
            if (diffs.b) bSpan.textContent = details.value.b;
        },
        {
            template: template,
            debounceTime: 0,
        }
    );

    t.teardown(() => {
        unsub();
        window.close();
    });

    await sleep(10);
    t.is(container.querySelectorAll('p').length, 3);
    t.is(container.querySelectorAll('p')[0].textContent, '1 - text-1');
    _collection.value = [
        { a: '2', b: 'text-2' },
        { a: '3', b: 'text-3' },
    ];
    await sleep(10);
    t.is(container.querySelectorAll('p').length, 2);
    t.is(container.querySelectorAll('p')[0].textContent, '2 - text-2');
    _collection.value = [
        { a: '4', b: 'text-4' },
        { a: '3', b: 'text-3' },
    ];
    await sleep(10);
    t.is(container.querySelectorAll('p')[0].textContent, '4 - text-4');
});

test('bindToList with custom createItem that attaches event listeners', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    document.body.append(container);
    const _collection = collection([]);
    let clicked = false;

    const unsub = bindToList(
        container,
        _collection,
        (listItemHelper, details) => {
            details.itemElement.textContent = details.value;
        },
        {
            createItem: () => {
                const btn = document.createElement('button');
                btn.className = 'btn';
                btn.onclick = () => {
                    clicked = true;
                };
                return btn;
            },
            debounceTime: 0,
        }
    );

    t.teardown(() => {
        unsub();
        window.close();
    });

    _collection.value = ['click me'];
    await sleep(10);
    const btn = container.querySelector('.btn');
    btn.click();
    t.true(clicked);
});

test('bindToList throws error when no createItem and no template', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    container.innerHTML = '';
    document.body.append(container);
    const _collection = collection([]);
    t.throws(
        () => {
            bindToList(container, _collection, () => {});
        },
        { message: /Either createItem or template must be provided/ }
    );
    window.close();
});

test('bindToList handles setData after length change', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    document.body.append(container);

    const template = createTemplate('<span></span>', document);
    const _collection = collection([0, 1, 2, 3]);
    const unsub = bindToList(
        container,
        _collection,
        (helper, details) => {
            details.itemElement.textContent = String(details.value);
        },
        {
            template: template,
            debounceTime: 0,
        }
    );

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(container.querySelectorAll('span').length, 4);
    t.is(container.querySelectorAll('span')[2].textContent, '2');
    _collection.value = [3, 2, 1];
    t.is(container.querySelectorAll('span').length, 3);
    t.is(container.querySelectorAll('span')[2].textContent, '1');
});

test('bindToList ListItemHelper methods getListItemIndex and getListItem', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    document.body.append(container);

    const template = createTemplate(
        '<p><span class="a"></span><span class="b"></span></p>',
        document
    );

    const _collection = collection([{ a: '0', b: 'text-0' }]);
    const unsub = bindToList(
        container,
        _collection,
        (listItemHelper, details) => {
            const aSpan = details.itemElement.querySelector('.a');
            const bSpan = details.itemElement.querySelector('.b');
            const diffs = getDiffs(details.value, details.oldValue);
            if (diffs.a) aSpan.textContent = details.value.a;
            if (diffs.b) bSpan.textContent = details.value.b;
            t.is(listItemHelper.getListItem(aSpan), details.itemElement);
            t.is(listItemHelper.getListItemIndex(details.itemElement), details.index);
            t.is(listItemHelper.getListItemIndex(aSpan), details.index);
        },
        {
            template: template,
            debounceTime: 0,
        }
    );

    t.teardown(() => {
        unsub();
        window.close();
    });

    _collection.value = [
        { a: '1', b: 'text-1' },
        { a: '2', b: 'text-2' },
        { a: '3', b: 'text-3' },
    ];
});

test('bindToList handles full array replacement', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    document.body.append(container);

    const template = createTemplate('<span></span>', document);
    const _collection = collection([1, 2, 3]);
    const unsub = bindToList(
        container,
        _collection,
        (helper, details) => {
            details.itemElement.textContent = String(details.value);
        },
        {
            template: template,
            debounceTime: 0,
        }
    );

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(container.querySelectorAll('span').length, 3);
    t.is(container.querySelectorAll('span')[0].textContent, '1');
    _collection.value = [10, 20];
    t.is(container.querySelectorAll('span').length, 2);
    t.is(container.querySelectorAll('span')[0].textContent, '10');
    t.is(container.querySelectorAll('span')[1].textContent, '20');
});

test('bindToList auto-disconnects when container element is removed from DOM', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    document.body.append(container);

    const template = createTemplate('<span></span>', document);
    const _collection = collection(['a', 'b']);
    const unsub = bindToList(
        container,
        _collection,
        (helper, details) => {
            details.itemElement.textContent = details.value;
        },
        {
            template: template,
            debounceTime: 0,
            autoDisconnect: true,
        }
    );

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.is(container.querySelectorAll('span').length, 2);
    container.remove();
    _collection.value = ['c', 'd'];
    t.is(container.querySelectorAll('span').length, 2);
    t.is(container.querySelectorAll('span')[0].textContent, 'a');
});

test('bindToList handles push and pop (add/remove)', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    document.body.append(container);

    const template = createTemplate('<span></span>', document);
    const coll = collection(['a', 'b']);
    const unsub = bindToList(
        container,
        coll,
        (helper, details) => {
            details.itemElement.textContent = details.value;
        },
        {
            template: template,
            debounceTime: 0,
        }
    );

    t.teardown(() => {
        unsub();
        window.close();
    });

    await sleep(10);
    t.is(container.querySelectorAll('span').length, 2);
    t.is(container.querySelectorAll('span')[0].textContent, 'a');

    coll.value.push('c');
    await sleep(10);
    t.is(container.querySelectorAll('span').length, 3);
    t.is(container.querySelectorAll('span')[2].textContent, 'c');

    coll.value.pop();
    await sleep(10);
    t.is(container.querySelectorAll('span').length, 2);
    t.is(container.querySelectorAll('span')[1].textContent, 'b');

    coll.value[0] = 'x';
    await sleep(10);
    t.is(container.querySelectorAll('span')[0].textContent, 'x');
});

test('bindToList getListItemIndex and getListItem with nested elements', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    document.body.append(container);

    const template = createTemplate('<div><span class="inner"></span></div>', document);
    const coll = collection([{ id: 1 }]);
    let helperRef;
    const unsub = bindToList(
        container,
        coll,
        (helper, details) => {
            helperRef = helper;
            const inner = details.itemElement.querySelector('.inner');
            if (inner) inner.textContent = details.value.id;
        },
        {
            template: template,
            debounceTime: 0,
        }
    );

    t.teardown(() => {
        unsub();
        window.close();
    });

    t.truthy(helperRef);
    const itemEl = container.querySelector('div');
    const innerSpan = container.querySelector('.inner');
    t.is(helperRef.getListItem(innerSpan), itemEl);
    t.is(helperRef.getListItemIndex(innerSpan), 0);
    t.is(helperRef.getListItemIndex(itemEl), 0);
});

test('ListItemHelper.getListItemIndex returns -1 for element without item-index attribute', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const helper = new ListItemHelper();
    t.is(helper.getListItemIndex(div), -1);
    window.close();
});

test('ListItemHelper.getListItem returns null for non-list element', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const helper = new ListItemHelper();
    const div = document.createElement('div');
    document.body.append(div);
    t.is(helper.getListItem(div), null);
    window.close();
});

test('ListItemHelper.getListItemIndex returns -1 when item-index is missing on found element', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    const item = document.createElement('span');
    item.setAttribute('data-custom', '123');
    container.append(item);
    document.body.append(container);
    const helper = new ListItemHelper();
    const found = helper.getListItem(item, 'data-custom');
    t.is(found, item);
    t.is(helper.getListItemIndex(item), -1);
    window.close();
});

test('bindToList inserts item in the middle', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    document.body.append(container);

    const template = createTemplate('<span></span>', document);
    const coll = collection(['a', 'b', 'd']);
    const unsub = bindToList(
        container,
        coll,
        (helper, details) => {
            details.itemElement.textContent = details.value;
        },
        {
            template: template,
            debounceTime: 0,
        }
    );

    t.teardown(() => {
        unsub();
        window.close();
    });

    await sleep(10);
    t.is(container.querySelectorAll('span').length, 3);
    t.is(container.querySelectorAll('span')[1].textContent, 'b');

    coll.value.splice(2, 0, 'c');
    await sleep(10);

    t.is(container.querySelectorAll('span').length, 4);
    t.is(container.querySelectorAll('span')[2].textContent, 'c');
    t.is(container.querySelectorAll('span')[3].textContent, 'd');

    const helper = new ListItemHelper();
    const items = container.querySelectorAll('span');
    t.is(helper.getListItemIndex(items[3]), 3);
});

test('bindToList rebuilds on multiple index updates (splice)', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    document.body.append(container);

    const template = createTemplate('<span></span>', document);
    const coll = collection(['a', 'b', 'c', 'd']);
    const unsub = bindToList(
        container,
        coll,
        (helper, details) => {
            details.itemElement.textContent = details.value;
        },
        {
            template: template,
            debounceTime: 0,
        }
    );

    t.teardown(() => {
        unsub();
        window.close();
    });

    await sleep(10);
    t.is(container.querySelectorAll('span').length, 4);

    coll.value.splice(1, 2, 'x', 'y');
    await sleep(10);

    t.is(container.querySelectorAll('span').length, 4);
    t.is(container.querySelectorAll('span')[0].textContent, 'a');
    t.is(container.querySelectorAll('span')[1].textContent, 'x');
    t.is(container.querySelectorAll('span')[2].textContent, 'y');
    t.is(container.querySelectorAll('span')[3].textContent, 'd');
});

test('bindToList removes item from the middle', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    document.body.append(container);

    const template = createTemplate('<span></span>', document);
    const coll = collection(['a', 'b', 'c', 'd']);
    const unsub = bindToList(
        container,
        coll,
        (helper, details) => {
            details.itemElement.textContent = details.value;
        },
        {
            template: template,
            debounceTime: 0,
        }
    );

    t.teardown(() => {
        unsub();
        window.close();
    });

    await sleep(10);
    t.is(container.querySelectorAll('span').length, 4);

    coll.value.splice(1, 1);
    await sleep(10);

    t.is(container.querySelectorAll('span').length, 3);
    t.is(container.querySelectorAll('span')[1].textContent, 'c');
    t.is(container.querySelectorAll('span')[2].textContent, 'd');
});

// ============================================================
// Tests for new API methods
// ============================================================

test('ListItemHelper.getKey and getListItemByKey', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    document.body.append(container);

    const template = createTemplate('<span></span>', document);
    const coll = collection([
        { id: 1, name: 'one' },
        { id: 2, name: 'two' },
    ]);
    let helperRef;

    const unsub = bindToList(
        container,
        coll,
        (helper, details) => {
            helperRef = helper;
            details.itemElement.textContent = details.value.name;
        },
        {
            template: template,
            getKey: 'id',
            debounceTime: 0,
        }
    );

    t.teardown(() => {
        unsub();
        window.close();
    });

    const items = container.querySelectorAll('span');
    const key1 = helperRef.getKey(items[0]);
    t.is(key1, '1');
    const key2 = helperRef.getKey(items[1]);
    t.is(key2, '2');

    const found = helperRef.getListItemByKey('2');
    t.is(found, items[1]);
    t.is(helperRef.getListItemByKey('999'), null);
});

test('ListItemHelper.findIndex', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    document.body.append(container);

    const template = createTemplate('<span></span>', document);
    const coll = collection([
        { id: 1, name: 'one' },
        { id: 2, name: 'two' },
    ]);
    let helperRef;

    const unsub = bindToList(
        container,
        coll,
        (helper, details) => {
            helperRef = helper;
            details.itemElement.textContent = details.value.name;
        },
        {
            template: template,
            getKey: 'id',
            debounceTime: 0,
        }
    );

    t.teardown(() => {
        unsub();
        window.close();
    });

    const array = coll.value;
    t.is(helperRef.findIndex(array, '1'), 0);
    t.is(helperRef.findIndex(array, '2'), 1);
    t.is(helperRef.findIndex(array, '999'), -1);
});

test('bindToList onRemoveItem callback', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    document.body.append(container);

    const template = createTemplate('<span></span>', document);
    const coll = collection(['a', 'b', 'c']);
    const removed = [];

    const unsub = bindToList(container, coll, (helper, details) => {
        details.itemElement.textContent = details.value;
    }, {
        template: template,
        getKey: (value) => value, // <-- явный ключ (значение строки)
        debounceTime: 0,
        onRemoveItem: (el, value, index) => {
            removed.push({ value, index });
        },
    });

    t.teardown(() => {
        unsub();
        window.close();
    });

    await sleep(10);
    t.is(container.querySelectorAll('span').length, 3);

    coll.value.pop(); // remove 'c'
    await sleep(10);
    t.deepEqual(removed, [{ value: 'c', index: 2 }]);
    t.is(container.querySelectorAll('span').length, 2);

    coll.value.splice(0, 1); // remove 'a'
    await sleep(10);
    t.deepEqual(removed, [
        { value: 'c', index: 2 },
        { value: 'a', index: 0 },
    ]);
    t.is(container.querySelectorAll('span').length, 1);
});
