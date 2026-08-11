// @ts-check

import { globalOptions } from './../globalOptions.js';
import { getDiffs } from '../utils/helpers.js';
import { attachAbortSignal } from '../utils/abort-helper.js';

const itemIndexAttrName = 'item-index';

/** @typedef {(listItemHelper:ListItemHelper)=>HTMLElement} TypeItemCreator */

/**
 * @template T
 */
class ElementList {
    /** @type {HTMLElement} */
    #rootListElement;

    /** @type {import("@supercat1337/store2").ReactiveItem & { value: T[] }} */
    #reactiveItem;

    /** @type {(listItemHelper:ListItemHelper, details:ListItemSetterDetails<T>)=>void} */
    #itemValueSetter;

    /** @type {TypeItemCreator} */
    #elementItemCreator;

    /** @type {ListItemHelper} */
    #listItemHelper;

    /**
     * Initializes the ElementList instance.
     * @param {import("@supercat1337/store2").ReactiveItem & { value: T[] }} reactiveItem
     * @param {HTMLElement} element
     * @param {(listItemHelper:ListItemHelper, details:ListItemSetterDetails<T>)=>void} itemValueSetter
     * @param {TypeItemCreator|null} [elementItemCreator]
     */
    constructor(reactiveItem, element, itemValueSetter, elementItemCreator) {
        this.#reactiveItem = reactiveItem;
        this.#rootListElement = element;

        this.#listItemHelper = new ListItemHelper(this.#loadTemplate());
        this.#rootListElement.innerHTML = '';

        if (elementItemCreator) {
            this.#elementItemCreator = () => elementItemCreator(this.#listItemHelper);
        } else {
            if (this.#listItemHelper.hasTemplate()) {
                this.#elementItemCreator = () => {
                    const itemElement = /** @type {HTMLElement} */ (
                        this.#listItemHelper.getTemplate()
                    );
                    // Template existence is guaranteed by hasTemplate()
                    return itemElement;
                };
            } else {
                throw new Error('elementItemCreator or template is not set');
            }
        }

        this.#itemValueSetter = itemValueSetter;
        // Initial render
        this.replaceAll(this.#reactiveItem.value);
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
        if (!listItem) return;
        listItem.setAttribute(itemIndexAttrName, String(index));
        const details = new ListItemSetterDetails(
            listItem,
            index,
            value,
            oldValue,
            this.#reactiveItem.value.length
        );
        this.#itemValueSetter(this.#listItemHelper, details);
    }

    /**
     * Inserts a new item at the given index.
     * @param {number} index
     * @param {T} value
     */
    insertItem(index, value) {
        const newElement = this.#elementItemCreator(this.#listItemHelper);
        const nextSibling = this.#rootListElement.children.item(index);
        if (nextSibling) {
            this.#rootListElement.insertBefore(newElement, nextSibling);
        } else {
            this.#rootListElement.append(newElement);
        }
        this.#updateIndexes(index);
        this.updateItem(index, value, undefined);
    }

    /**
     * Removes the item at the given index.
     * @param {number} index
     */
    removeItem(index) {
        const item = this.#rootListElement.children.item(index);
        if (!item) return;
        item.remove();
        this.#updateIndexes(index);
    }

    /**
     * Completely rebuilds the list from the given array.
     * @param {T[]} arr
     */
    replaceAll(arr) {
        this.#rootListElement.innerHTML = '';
        for (let i = 0; i < arr.length; i++) {
            const newElement = this.#elementItemCreator(this.#listItemHelper);
            this.#rootListElement.append(newElement);
            newElement.setAttribute(itemIndexAttrName, String(i));
            const details = new ListItemSetterDetails(newElement, i, arr[i], undefined, arr.length);
            this.#itemValueSetter(this.#listItemHelper, details);
        }
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
export class ListItemSetterDetails {
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

    /**
     * @param {HTMLElement} itemElement
     * @param {number} index
     * @param {T} value
     * @param {any} oldValue
     * @param {number} length
     */
    constructor(itemElement, index, value, oldValue, length) {
        this.itemElement = itemElement;
        this.index = index;
        this.value = value;
        this.oldValue = oldValue;
        this.length = length;
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
 * @param {(listItemHelper:ListItemHelper, details:ListItemSetterDetails<T>) => void} itemValueSetter
 * @param {TypeItemCreator|null} [elementItemCreator]
 * @param {import("../types.d.ts").BindToListOptions} [options={}]
 * @returns {()=>void}
 */
export function bindToList(
    listElement,
    reactiveItem,
    itemValueSetter,
    elementItemCreator,
    options = {}
) {
    const elementListWrapper = new ElementList(
        reactiveItem,
        listElement,
        itemValueSetter,
        elementItemCreator
    );
    const _options = Object.assign({}, globalOptions, options);
    const { autoDisconnect, signal, debounceTime } = _options;

    const unsubscribe = reactiveItem.subscribe(
        updates => {

            if (autoDisconnect && !listElement.isConnected) {
                unsubscribe();
                return;
            }

            let lengthUpdate = null;
            const indexUpdates = [];

            // Separate length update from index updates
            for (const [key, record] of updates) {
                if (key === 'length') {
                    lengthUpdate = record;
                    continue;
                }
                const index = parseInt(key, 10);
                indexUpdates.push({ index, record });
            }

            // If there are multiple index updates, it's likely a splice or full replacement
            // Rebuild the entire list to keep it simple and correct.
            if (updates.get("")) {
                elementListWrapper.replaceAll(reactiveItem.value);
                return;
            }

            // Process the single index update if any
            for (const { index, record } of indexUpdates) {
                const { type, oldValue, value } = record;
                if (type === 'delete') {
                    elementListWrapper.removeItem(index);
                } else if (type === 'set') {
                    if (oldValue === undefined && value !== undefined) {
                        // Insert
                        elementListWrapper.insertItem(index, value);
                    } else {
                        // Update existing
                        elementListWrapper.updateItem(index, value, oldValue);
                    }
                }
            }

            // Handle length change: if the list is longer than expected, remove trailing items
            if (lengthUpdate) {
                const newLength = lengthUpdate.value;
                const currentLength = listElement.children.length;
                if (newLength < currentLength) {
                    for (let i = currentLength - 1; i >= newLength; i--) {
                        elementListWrapper.removeItem(i);
                    }
                }
                // If newLength > currentLength, we assume the items were added via the index update.
            }
        },
        { delay: debounceTime }
    );

    const removeAbortListener = attachAbortSignal(signal, unsubscribe);

    return () => {
        unsubscribe();
        removeAbortListener();
    };
}
