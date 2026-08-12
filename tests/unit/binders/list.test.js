// @ts-check
import test from 'ava';
import { JSDOM } from 'jsdom';
import { bindToList, ListItemHelper, ListItemUpdateContext, getDiffs } from '../../../src/index.js';
import { collection, sleep } from '@supercat1337/store2';

test('bindToList with custom elementItemCreator (no template)', async t => {
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
        () => document.createElement('span')
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

test('bindToList with item template (first child as template)', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    container.innerHTML = '<span class="item"></span>';
    document.body.append(container);
    const _collection = collection(['a', 'b', 'c']);
    const unsub = bindToList(container, _collection, (listItemHelper, details) => {
        details.itemElement.textContent = details.value;
    });

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

test('bindToList with object items and getDiffs', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    container.innerHTML = '<p><span class="a"></span> - <span class="b"></span></p>';
    document.body.append(container);
    const _collection = collection([
        { a: '1', b: 'text-1' },
        { a: '2', b: 'text-2' },
        { a: '3', b: 'text-3' },
    ]);
    const unsub = bindToList(container, _collection, (listItemHelper, details) => {
        const aSpan = details.itemElement.querySelector('.a');
        const bSpan = details.itemElement.querySelector('.b');
        const diffs = getDiffs(details.value, details.oldValue);
        if (diffs.a) aSpan.textContent = details.value.a;
        if (diffs.b) bSpan.textContent = details.value.b;
    });

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

test('bindToList with template and custom element creator (init function)', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    container.innerHTML = '<button class="btn"></button>';
    document.body.append(container);
    const _collection = collection([]);
    let clicked = false;
    const unsub = bindToList(
        container,
        _collection,
        (listItemHelper, details) => {
            details.itemElement.textContent = details.value;
        },
        listItemHelper => {
            const element = listItemHelper.getTemplate();
            if (element) {
                element.onclick = () => {
                    clicked = true;
                };
            }
            return element;
        }
    );

    t.teardown(() => {
        unsub();
        window.close();
    });

    _collection.value = ['click me'];
    const btn = container.querySelector('.btn');
    btn.click();
    t.true(clicked);
});

test('bindToList throws error when no template and no elementItemCreator', t => {
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
        { message: /elementItemCreator or template is not set/ }
    );
    window.close(); // в этом тесте нет подписки, просто закрываем окно
});

test('bindToList handles setData after length change', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    container.innerHTML = '<span></span>';
    document.body.append(container);
    const _collection = collection([0, 1, 2, 3]);
    const unsub = bindToList(container, _collection, (helper, details) => {
        details.itemElement.textContent = String(details.value);
    });

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
    container.innerHTML = '<p><span class="a"></span><span class="b"></span></p>';
    document.body.append(container);
    const _collection = collection([{ a: '0', b: 'text-0' }]);
    const unsub = bindToList(container, _collection, (listItemHelper, details) => {
        const aSpan = details.itemElement.querySelector('.a');
        const bSpan = details.itemElement.querySelector('.b');
        const diffs = getDiffs(details.value, details.value);
        if (diffs.a) aSpan.textContent = details.value.a;
        if (diffs.b) bSpan.textContent = details.value.b;
        t.is(listItemHelper.getListItem(aSpan), details.itemElement);
        t.is(listItemHelper.getListItemIndex(details.itemElement), details.index);
        t.is(listItemHelper.getListItemIndex(aSpan), details.index);
    });

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

test('bindToList handles full array replacement (property === null)', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    container.innerHTML = '<span></span>';
    document.body.append(container);
    const _collection = collection([1, 2, 3]);
    const unsub = bindToList(container, _collection, (helper, details) => {
        details.itemElement.textContent = String(details.value);
    });

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
    container.innerHTML = '<span></span>';
    document.body.append(container);
    const _collection = collection(['a', 'b']);
    const unsub = bindToList(container, _collection, (helper, details) => {
        details.itemElement.textContent = details.value;
    });

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
    container.innerHTML = '<span></span>';
    document.body.append(container);
    const coll = collection(['a', 'b']);
    const unsub = bindToList(container, coll, (helper, details) => {
        details.itemElement.textContent = details.value;
    });

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
    container.innerHTML = '<div><span class="inner"></span></div>';
    document.body.append(container);
    const coll = collection([{ id: 1 }]);
    let helperRef;
    const unsub = bindToList(container, coll, (helper, details) => {
        helperRef = helper;
        const inner = details.itemElement.querySelector('.inner');
        if (inner) inner.textContent = details.value.id;
    });

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
    // getListItem вернёт null, потому что нет атрибута item-index
    t.is(helper.getListItemIndex(div), -1);
    window.close();
});

test('ListItemHelper.getTemplate returns null when no template', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const helper = new ListItemHelper(); // без template
    t.is(helper.getTemplate(), null);
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
    item.setAttribute('data-custom', '123'); // только этот атрибут
    container.append(item);
    document.body.append(container);
    const helper = new ListItemHelper();
    // getListItem с кастомным атрибутом вернёт элемент
    const found = helper.getListItem(item, 'data-custom');
    t.is(found, item);
    // но атрибута item-index нет → getListItemIndex вернёт -1
    t.is(helper.getListItemIndex(item), -1);
    window.close();
});

test('ListItemHelper.getListItemIndex returns -1 for non-list element', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const div = document.createElement('div');
    document.body.append(div);
    const helper = new ListItemHelper();
    t.is(helper.getListItemIndex(div), -1);
    window.close();
});

test('ListItemHelper.getListItemIndex returns -1 when item-index is missing', t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    const item = document.createElement('span');
    item.setAttribute('data-custom', '123');
    container.append(item);
    document.body.append(container);
    const helper = new ListItemHelper();
    // getListItem с кастомным атрибутом вернёт элемент
    const found = helper.getListItem(item, 'data-custom');
    t.is(found, item);
    // Но у элемента нет item-index → getListItemIndex вернёт -1
    t.is(helper.getListItemIndex(item), -1);
    window.close();
});

test('bindToList inserts item in the middle', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    container.innerHTML = '<span></span>';
    document.body.append(container);
    const coll = collection(['a', 'b', 'd']);
    const unsub = bindToList(container, coll, (helper, details) => {
        details.itemElement.textContent = details.value;
    });

    t.teardown(() => {
        unsub();
        window.close();
    });

    await sleep(10);
    t.is(container.querySelectorAll('span').length, 3);
    t.is(container.querySelectorAll('span')[1].textContent, 'b');

    // Вставляем 'c' на позицию 2 (между 'b' и 'd')
    coll.value.splice(2, 0, 'c');
    await sleep(10);

    t.is(container.querySelectorAll('span').length, 4);
    t.is(container.querySelectorAll('span')[2].textContent, 'c');
    t.is(container.querySelectorAll('span')[3].textContent, 'd');
    // Проверяем, что индексы обновились
    const helper = new ListItemHelper();
    const items = container.querySelectorAll('span');
    t.is(helper.getListItemIndex(items[3]), 3);
});

test('bindToList rebuilds on multiple index updates (splice)', async t => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const window = dom.window;
    const document = window.document;
    const container = document.createElement('div');
    container.innerHTML = '<span></span>';
    document.body.append(container);
    const coll = collection(['a', 'b', 'c', 'd']);
    const unsub = bindToList(container, coll, (helper, details) => {
        details.itemElement.textContent = details.value;
    });

    t.teardown(() => {
        unsub();
        window.close();
    });

    await sleep(10);
    t.is(container.querySelectorAll('span').length, 4);

    // Заменяем два элемента на один (splice с удалением и вставкой)
    coll.value.splice(1, 2, 'x', 'y');
    await sleep(10);

    // Ожидаем, что список перестроился (полная замена)
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
    container.innerHTML = '<span></span>';
    document.body.append(container);
    const coll = collection(['a', 'b', 'c', 'd']);
    const unsub = bindToList(container, coll, (helper, details) => {
        details.itemElement.textContent = details.value;
    });

    t.teardown(() => {
        unsub();
        window.close();
    });

    await sleep(10);
    t.is(container.querySelectorAll('span').length, 4);

    coll.value.splice(1, 1); // удаляем 'b'
    await sleep(10);

    t.is(container.querySelectorAll('span').length, 3);
    t.is(container.querySelectorAll('span')[1].textContent, 'c');
    t.is(container.querySelectorAll('span')[2].textContent, 'd');
});
