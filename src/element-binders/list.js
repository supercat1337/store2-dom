// @ts-check

import { globalOptions } from './../globalOptions.js';
import { getDiffs } from '../utils/helpers.js';
import { attachAbortSignal } from '../utils/abort-helper.js';
import { compareAny } from '@supercat1337/store2';

const itemIndexAttrName = 'item-index';

/**
 * @template T
 */
class ElementList {
    /** @type {HTMLElement} */
    #rootListElement;

    /** @type {import("@supercat1337/store2").ReactiveItem & { value: T[] }} */
    #reactiveItem;

    /** @type {(listItemHelper:ListItemHelper, details:ListItemUpdateContext<T>)=>void} */
    #onUpdateItem;

    /** @type {import('../types.d.ts').TypeItemCreator} */
    #createItem;

    /** @type {ListItemHelper} */
    #listItemHelper;

    /** @type {null | ((value: T, index: number) => string | number)} */
    #getKey = null;

    /** @type {T[]} */
    #currentArray = [];

    /**
     * Initializes the ElementList instance.
     * @param {import("@supercat1337/store2").ReactiveItem & { value: T[] }} reactiveItem
     * @param {HTMLElement} element
     * @param {(listItemHelper:ListItemHelper, details:ListItemUpdateContext<T>)=>void} onUpdateItem
     * @param {import('../types.d.ts').TypeItemCreator|null} [createItem]
     * @param {import('../types.d.ts').BindToListOptions & { getKey?: string | ((value: T, index: number) => string | number) }} [options]
     */
    constructor(reactiveItem, element, onUpdateItem, createItem = null, options = {}) {
        this.#reactiveItem = reactiveItem;
        this.#rootListElement = element;

        this.#listItemHelper = new ListItemHelper(this.#loadTemplate());
        this.#rootListElement.innerHTML = '';

        if (createItem) {
            this.#createItem = () => createItem(this.#listItemHelper);
        } else {
            if (this.#listItemHelper.hasTemplate()) {
                this.#createItem = () => {
                    const itemElement = /** @type {HTMLElement} */ (
                        this.#listItemHelper.getTemplate()
                    );
                    return itemElement;
                };
            } else {
                throw new Error('createItem or template is not set');
            }
        }

        this.#onUpdateItem = onUpdateItem;

        // Setup getKey
        const { getKey } = options;
        if (typeof getKey === 'string') {
            // @ts-ignore
            this.#getKey = value => value?.[getKey];
        } else if (typeof getKey === 'function') {
            this.#getKey = getKey;
        } else {
            // No getKey provided – use index as key (ensures unique identification)
            this.#getKey = (value, index) => index;
        }

        // Initial render
        this.replaceAll(this.#reactiveItem.value);
        this.#currentArray = this.#reactiveItem.value.slice(); // copy
    }

    /**
     * Loads the first child as template.
     * @returns {HTMLElement|undefined}
     */
    #loadTemplate() {
        const listItem = this.#rootListElement.firstElementChild;
        if (listItem) {
            return /** @type {HTMLElement} */ (listItem.cloneNode(true));
        }
        return undefined;
    }

    /**
     * Updates an existing item at the given index.
     * @param {number} index
     * @param {T} value
     * @param {any} oldValue
     */
    updateItem(index, value, oldValue) {
        const listItem = /** @type {HTMLElement} */ (this.#rootListElement.children.item(index));
        if (!listItem) {
            return;
        }
        listItem.setAttribute(itemIndexAttrName, String(index));

        let key;
        if (this.#getKey) {
            const rawKey = this.#getKey(value, index);
            if (rawKey !== undefined && rawKey !== null) {
                key = rawKey;
                listItem.dataset.key = String(key);
            }
        }

        const details = new ListItemUpdateContext(
            listItem,
            index,
            value,
            oldValue,
            this.#reactiveItem.value.length,
            key
        );
        this.#onUpdateItem(this.#listItemHelper, details);

        // Update current array
        if (this.#currentArray[index] !== undefined) {
            this.#currentArray[index] = value;
        }
    }

    /**
     * Inserts a new item at the given index.
     * @param {number} index
     * @param {T} value
     */
    insertItem(index, value) {
        const newElement = this.#createItem(this.#listItemHelper);
        const nextSibling = this.#rootListElement.children.item(index);
        if (nextSibling) {
            this.#rootListElement.insertBefore(newElement, nextSibling);
        } else {
            this.#rootListElement.append(newElement);
        }
        this.#updateIndexes(index);
        this.#currentArray.splice(index, 0, value);
        this.updateItem(index, value, undefined);
    }

    /**
     * Removes the item at the given index.
     * @param {number} index
     */
    removeItem(index) {
        const item = this.#rootListElement.children.item(index);
        if (!item) {
            return;
        }
        item.remove();
        this.#updateIndexes(index);
        this.#currentArray.splice(index, 1);
    }

    /**
     * Completely rebuilds the list from the given array.
     * @param {T[]} arr
     */
    replaceAll(arr) {
        this.#rootListElement.innerHTML = '';
        for (let i = 0; i < arr.length; i++) {
            const newElement = this.#createItem(this.#listItemHelper);
            this.#rootListElement.append(newElement);
            newElement.setAttribute(itemIndexAttrName, String(i));

            let key;
            if (this.#getKey) {
                const rawKey = this.#getKey(arr[i], i);
                if (rawKey !== undefined && rawKey !== null) {
                    key = rawKey;
                    newElement.dataset.key = String(key);
                }
            }

            const details = new ListItemUpdateContext(
                newElement,
                i,
                arr[i],
                undefined,
                arr.length,
                key
            );
            this.#onUpdateItem(this.#listItemHelper, details);
        }
        this.#currentArray = arr.slice();
    }

    /**
     * Synchronizes the DOM list with the given array using keys for minimal updates.
     * @param {T[]} newArray
     */
    syncWithArray(newArray) {
        if (!this.#getKey) {
            this.replaceAll(newArray);
            return;
        }

        const oldArray = this.#currentArray;
        const oldMap = new Map();
        const children = Array.from(this.#rootListElement.children);
        for (let i = 0; i < children.length; i++) {
            const el = /** @type {HTMLElement} */ (children[i]);
            const key = el.dataset.key;
            if (key !== undefined && key !== '') {
                const oldValue = oldArray[i] !== undefined ? oldArray[i] : undefined;
                oldMap.set(key, { element: el, index: i, value: oldValue });
            }
        }

        const newElements = [];

        for (let i = 0; i < newArray.length; i++) {
            const value = newArray[i];
            const rawKey = this.#getKey(value, i);
            const key = rawKey !== undefined && rawKey !== null ? String(rawKey) : undefined;
            let element;

            if (key !== undefined && oldMap.has(key)) {
                const entry = oldMap.get(key);
                element = entry.element;
                oldMap.delete(key);
                element.setAttribute(itemIndexAttrName, String(i));
                if (element.dataset.key !== key) {
                    element.dataset.key = key;
                }
                const oldValue = entry.value;
                // Compare old and new values to decide if we need to update
                const hasChanged = !compareAny(oldValue, value);
                if (hasChanged || oldValue === undefined) {
                    const details = new ListItemUpdateContext(
                        element,
                        i,
                        value,
                        oldValue,
                        newArray.length,
                        key
                    );
                    this.#onUpdateItem(this.#listItemHelper, details);
                }
                // else: data hasn't changed, skip update
            } else {
                element = this.#createItem(this.#listItemHelper);
                element.setAttribute(itemIndexAttrName, String(i));
                if (key !== undefined) {
                    element.dataset.key = key;
                }
                // New element always needs initial update
                const details = new ListItemUpdateContext(
                    element,
                    i,
                    value,
                    undefined,
                    newArray.length,
                    key
                );
                this.#onUpdateItem(this.#listItemHelper, details);
            }
            newElements.push(element);
        }

        // Remove elements that no longer exist
        for (const [key, entry] of oldMap) {
            entry.element.remove();
        }

        // Reorder existing elements in the correct order
        let currentChild = this.#rootListElement.firstChild;
        for (let i = 0; i < newElements.length; i++) {
            const el = newElements[i];
            if (el !== currentChild) {
                this.#rootListElement.insertBefore(el, currentChild);
            }
            currentChild = el.nextSibling;
        }
        // Remove any leftover trailing elements
        while (currentChild) {
            const next = currentChild.nextSibling;
            currentChild.remove();
            currentChild = next;
        }

        this.#currentArray = newArray.slice();
    }

    /**
     * Updates `item-index` attributes from `startIndex` to the end.
     * @param {number} startIndex
     */
    #updateIndexes(startIndex) {
        const children = this.#rootListElement.children;
        for (let i = startIndex; i < children.length; i++) {
            children[i].setAttribute(itemIndexAttrName, String(i));
        }
    }
}

/**
 * Returns the list item element by attribute.
 * @param {HTMLElement} element
 * @param {string} [attrName]
 * @returns {HTMLElement|null}
 */
function getListItem(element, attrName) {
    const searchAttr = attrName || itemIndexAttrName;
    const value = element.getAttribute(searchAttr);
    if (value !== null) {
        return element;
    }
    return element.closest(`[${searchAttr}]`);
}

/**
 * Returns the index of the list item element.
 * @param {HTMLElement} element
 * @returns {number}
 */
function getListItemIndex(element) {
    const listItem = getListItem(element);
    if (!listItem) {
        return -1;
    }
    const index = listItem.getAttribute(itemIndexAttrName);
    // index is guaranteed to be non-null because getListItem found the element by this attribute
    // @ts-ignore
    return parseInt(index, 10);
}

// ===== Exported classes and functions =====

/**
 * @template T
 */
export class ListItemUpdateContext {
    /** @type {HTMLElement} */
    itemElement;
    /** @type {number} */
    index;
    /** @type {T} */
    value;
    /** @type {any} */
    oldValue;
    /** @type {number} */
    length;
    /** @type {string|number|undefined} */
    key;

    /**
     * @param {HTMLElement} itemElement
     * @param {number} index
     * @param {T} value
     * @param {any} oldValue
     * @param {number} length
     * @param {string|number|undefined} key
     */
    constructor(itemElement, index, value, oldValue, length, key) {
        this.itemElement = itemElement;
        this.index = index;
        this.value = value;
        this.oldValue = oldValue;
        this.length = length;
        this.key = key;
    }
}

export class ListItemHelper {
    /** @type {HTMLElement|null} */
    #templateElement = null;

    /**
     * @param {HTMLElement} [templateElement]
     */
    constructor(templateElement) {
        if (templateElement) {
            this.#templateElement = templateElement;
        }
    }

    /**
     * @returns {boolean}
     */
    hasTemplate() {
        return this.#templateElement != null;
    }

    /**
     * @returns {HTMLElement|null}
     */
    getTemplate() {
        if (this.#templateElement == null) {
            return null;
        }
        return /** @type {HTMLElement} */ (this.#templateElement.cloneNode(true));
    }

    /**
     * @param {HTMLElement} element
     * @returns {number}
     */
    getListItemIndex(element) {
        return getListItemIndex(element);
    }

    /**
     * @param {HTMLElement} element
     * @param {string} [attrName]
     * @returns {HTMLElement|null}
     */
    getListItem(element, attrName) {
        return getListItem(element, attrName);
    }

    /**
     * @template {{[key:string]:any}} T
     * @param {T} newObject
     * @param {any} oldObject
     * @param {(a:any, b:any)=>boolean} [customCompareFunction]
     * @returns {{[key in keyof T]:boolean}}
     */
    getDiffs(newObject, oldObject, customCompareFunction) {
        return getDiffs(newObject, oldObject, customCompareFunction);
    }
}

/**
 * Binds a reactive array to a list element.
 * @template T
 * @param {HTMLElement} listElement
 * @param {import("@supercat1337/store2").ReactiveItem & { value: T[] }} reactiveItem
 * @param {(listItemHelper:ListItemHelper, details:ListItemUpdateContext<T>) => void} onUpdateItem
 * @param {import('../types.d.ts').TypeItemCreator|null} [createItem]
 * @param {import("../types.d.ts").BindToListOptions & { getKey?: string | ((value: T, index: number) => string | number) }} [options={}]
 * @returns {()=>void}
 */
export function bindToList(
    listElement,
    reactiveItem,
    onUpdateItem,
    createItem = null,
    options = {}
) {
    const elementListWrapper = new ElementList(
        reactiveItem,
        listElement,
        onUpdateItem,
        createItem,
        options
    );
    const _options = Object.assign({}, globalOptions, options);
    const { autoDisconnect, signal, debounceTime } = _options;

    const unsubscribe = reactiveItem.subscribe(
        updates => {
            if (autoDisconnect && !listElement.isConnected) {
                unsubscribe();
                return;
            }

            // Always use key-based sync.
            // If no getKey was provided, the ElementList uses index as key.
            elementListWrapper.syncWithArray(reactiveItem.value);
        },
        { delay: debounceTime }
    );

    const removeAbortListener = attachAbortSignal(signal, unsubscribe);

    return () => {
        unsubscribe();
        removeAbortListener();
    };
}
