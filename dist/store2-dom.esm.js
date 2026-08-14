import { Atom, debounce, compareAny, Collection } from '@supercat1337/store2';

// @ts-check

/**
 * Global options for the binders.
 *
 * @typedef {object} GlobalOptions
 * @property {number} [debounceTime=0] the default debounce time for all the binders
 * @property {boolean} [autoDisconnect=true] whether to automatically disconnect the subscriptions
 *                                   when the element is removed from the DOM
 */
const globalOptions = {
    debounceTime: 0,
    autoDisconnect: true,
};

// @ts-check

/**
 * Attaches an abort handler to an AbortSignal that calls the provided cleanup function when aborted.
 * If the signal is already aborted, cleanup is called immediately.
 *
 * @param {AbortSignal | undefined} signal - The abort signal (optional).
 * @param {() => void} cleanup - The cleanup function to call on abort.
 * @returns {() => void} - A function to remove the abort listener (no-op if signal not provided or already aborted).
 */
function attachAbortSignal(signal, cleanup) {
    if (!signal) {
        return () => {};
    }
    if (signal.aborted) {
        cleanup();
        return () => {};
    }
    const handler = () => {
        cleanup();
    };
    signal.addEventListener('abort', handler);
    return () => {
        signal.removeEventListener('abort', handler);
    };
}

// @ts-check


// binder is intended for one-way bindings that do not attach DOM event listeners.
// For two-way bindings, implement custom cleanup logic directly.

/**
 * Binds a reactive item to an element using a custom setter function.
 * @template T
 * @template {object} C
 * @param {HTMLElement} element - The DOM element.
 * @param {import("@supercat1337/store2").Atom<T> | import("@supercat1337/store2").Computed<T>} reactiveItem - The reactive item.
 * @param {(reactiveItem: import("@supercat1337/store2").Atom<T> | import("@supercat1337/store2").Computed<T>, element: HTMLElement, ctx: C, options: import("./types.d.ts").BinderOptions) => void} setter - Function that updates the element.
 * @param {C} [ctx] - Optional context object passed to setter.
 * @param {import("./types.d.ts").BinderOptions} [options={}] - Options (debounceTime, autoDisconnect, signal).
 * @returns {()=>void}
 */
function binder(element, reactiveItem, setter, ctx = /** @type {C} */ ({}), options = {}) {
    const _options = Object.assign({}, globalOptions, options);
    const { debounceTime, autoDisconnect, signal } = _options;

    setter(reactiveItem, element, ctx, _options);

    const unsubscribe = reactiveItem.subscribe(_details => {
        if (autoDisconnect && !element.isConnected) {
            unsubscribe();
            return;
        }
        setter(reactiveItem, element, ctx, _options);
    }, {delay: debounceTime});

    // Attach abort signal if provided
    const removeAbortListener = attachAbortSignal(signal, unsubscribe);

    // Return a combined unsubscribe function
    return () => {
        unsubscribe();
        removeAbortListener();
    };
}

// @ts-check


/**
 * Setter for attribute binding.
 * @param {import("@supercat1337/store2").Atom<string|null> | import("@supercat1337/store2").Computed<string|null>} reactiveItem
 * @param {HTMLElement} element
 * @param {{attributeName: string}} ctx
 */
function setter$5(reactiveItem, element, ctx) {
    if (typeof reactiveItem.value === 'string') {
        element.setAttribute(ctx.attributeName, reactiveItem.value);
    } else if (reactiveItem.value == null) {
        element.removeAttribute(ctx.attributeName);
    }
}

/**
 * Binds a reactive value to an element's attribute. If value is null, attribute is removed.
 * @param {HTMLElement} element - The DOM element.
 * @param {import("@supercat1337/store2").Atom<string|null> | import("@supercat1337/store2").Computed<string|null>} reactiveItem - The reactive item.
 * @param {string} attributeName - Name of the attribute.
 * @param {import("./types.d.ts").AttributeBindingOptions} [options={}] - Options.
 * @returns {()=>void}
 */
function bindToAttribute(element, reactiveItem, attributeName, options = {}) {
    const _options = Object.assign({}, globalOptions, options);
    return binder(element, reactiveItem, setter$5, { attributeName }, _options);
}

// @ts-check


/**
 * Setter that assigns reactive value to element's property.
 * @template T
 * @param {import("@supercat1337/store2").Atom<T> | import("@supercat1337/store2").Computed<T>} reactiveItem
 * @param {HTMLElement} element
 * @param {{propertyName: string}} ctx
 */
function setter$4(reactiveItem, element, ctx) {
    // @ts-ignore
    element[ctx.propertyName] = reactiveItem.value;
}

/**
 * Binds a reactive value to an element's DOM property.
 * @template T
 * @param {HTMLElement} element - The DOM element.
 * @param {import("@supercat1337/store2").Atom<T> | import("@supercat1337/store2").Computed<T>} reactiveItem - The reactive item.
 * @param {string} propertyName - Name of the property (e.g., 'innerHTML', 'className').
 * @param {import("./types.d.ts").BinderOptions} [options={}] - Options.
 * @returns {()=>void}
 */
function bindToProperty(element, reactiveItem, propertyName, options = {}) {
    const _options = Object.assign({}, globalOptions, options);
    return binder(element, reactiveItem, setter$4, { propertyName }, _options);
}

// @ts-check


/**
 * Binds a reactive string/number value to the element's innerHTML.
 * @param {HTMLElement} element - The DOM element.
 * @param {import("@supercat1337/store2").Atom<string|number> | import("@supercat1337/store2").Computed<string|number>} reactiveItem - The reactive item.
 * @param {import("./types.d.ts").BinderOptions} [options={}] - Options.
 * @returns {()=>void}
 */
function bindToHtml(element, reactiveItem, options = {}) {
    return bindToProperty(element, reactiveItem, 'innerHTML', options);
}

// @ts-check


/**
 * Binds a reactive string value to the element's className property.
 * @param {HTMLElement} element - The DOM element.
 * @param {import("@supercat1337/store2").Atom<string> | import("@supercat1337/store2").Computed<string>} reactiveItem - The reactive item.
 * @param {import("./types.d.ts").BinderOptions} [options={}] - Options.
 * @returns {()=>void}
 */
function bindToClassString(element, reactiveItem, options = {}) {
    return bindToProperty(element, reactiveItem, 'className', options);
}

// @ts-check


/**
 * Setter toggles a CSS class based on boolean reactive value with optional invert.
 * @param {import("@supercat1337/store2").Atom<boolean> | import("@supercat1337/store2").Computed<boolean>} reactiveItem
 * @param {HTMLElement} element
 * @param {{cssClassName: string}} ctx
 * @param {import("./types.d.ts").CssClassBindingOptions} options
 */
function setter$3(reactiveItem, element, ctx, options) {
    const shouldHaveClass = options.invert ? !reactiveItem.value : reactiveItem.value;
    element.classList.toggle(ctx.cssClassName, shouldHaveClass);
}

/**
 * Binds a boolean reactive value to a CSS class presence (toggles the class).
 * @param {HTMLElement} element - The DOM element.
 * @param {import("@supercat1337/store2").Atom<boolean> | import("@supercat1337/store2").Computed<boolean>} reactiveItem - The reactive item.
 * @param {string} cssClassName - The CSS class name to toggle.
 * @param {import("./types.d.ts").CssClassBindingOptions} [options={}] - Options (invert, debounceTime, autoDisconnect).
 * @returns {()=>void}
 */
function bindToCssClass(element, reactiveItem, cssClassName, options = {}) {
    const _options = Object.assign({}, globalOptions, { invert: false }, options);
    const ctx = { cssClassName };
    return binder(element, reactiveItem, setter$3, ctx, _options);
}

// @ts-check


/**
 * Binds a boolean reactive value to element visibility using a CSS class.
 * The class (by default "d-none") is added when reactive value is false,
 * and removed when true.
 * @param {HTMLElement} element - The DOM element.
 * @param {import("@supercat1337/store2").Atom<boolean> | import("@supercat1337/store2").Computed<boolean>} reactiveItem - The reactive item.
 * @param {import("./types.d.ts").ShowBindingOptions} [options={}] - Options (hideClassName, invert, debounceTime, autoDisconnect).
 *   - invert: if true, the class is added when reactive value is true (rarely needed).
 * @returns {()=>void}
 */
function bindToShow(element, reactiveItem, options = {}) {
    const _options = Object.assign(
        {},
        globalOptions,
        { hideClassName: 'd-none', invert: false }, // user's invert applies to show logic
        options
    );
    const { hideClassName, debounceTime, autoDisconnect, invert } = _options;

    // For show: class should be present when value is false (hidden)
    // So we need invert = true in the underlying css-class binding,
    // unless the user explicitly passed invert: true (then we use false).
    const effectiveInvert = !invert;

    return bindToCssClass(element, reactiveItem, hideClassName, {
        invert: effectiveInvert,
        debounceTime,
        autoDisconnect,
    });
}

// @ts-check

/**
 * Two-way binding between a checkbox and a boolean Atom.
 * @param {HTMLInputElement} checkbox - The checkbox element.
 * @param {import("@supercat1337/store2").Atom<boolean>} reactiveItem - The reactive boolean atom.
 * @param {import("./types.d.ts").BinderOptions & { event?: string }} [options={}] - Options (event, debounceTime, autoDisconnect, signal).
 * @returns {()=>void}
 */
function bindToCheckbox(checkbox, reactiveItem, options = {}) {
    if (!(reactiveItem instanceof Atom)) {
        throw new TypeError('bindToCheckbox expects an Atom<boolean>');
    }

    const _options = Object.assign({}, globalOptions, { event: 'change' }, options);
    const { debounceTime, autoDisconnect, event: eventName, signal } = _options;

    /** @param {boolean} value  */
    function setter(value) {
        checkbox.checked = value;
    }

    const changeHandler = () => {
        reactiveItem.value = checkbox.checked;
    };

    setter(reactiveItem.value);
    checkbox.addEventListener(eventName, changeHandler);

    const storeUnsubscribe = reactiveItem.subscribe(
        _details => {
            if (autoDisconnect && !checkbox.isConnected) {
                cleanup();
                return;
            }
            setter(reactiveItem.value);
        },
        { delay: debounceTime }
    );

    function cleanup() {
        checkbox.removeEventListener(eventName, changeHandler);
        storeUnsubscribe();
    }

    const removeAbortListener = attachAbortSignal(signal, cleanup);

    return () => {
        cleanup();
        removeAbortListener();
    };
}

// @ts-check


/**
 * Two-way binding between an input/textarea and a string/number Atom.
 * @param {HTMLInputElement|HTMLTextAreaElement} element - The input or textarea element.
 * @param {import("@supercat1337/store2").Atom<string|number>} reactiveItem - The reactive atom.
 * @param {import("./types.d.ts").TwoWayBindingOptions & { event?: string }} [options={}] - Options (lazy, event, debounceTime, autoDisconnect, signal).
 * @returns {()=>void}
 */
function bindToInput(element, reactiveItem, options = {}) {
    if (!(reactiveItem instanceof Atom)) {
        throw new TypeError('bindToInput expects an Atom<string|number>');
    }

    const _options = Object.assign({}, globalOptions, { lazy: false }, options);
    const { debounceTime, lazy, autoDisconnect, event: eventName, signal } = _options;

    /** @param {string|number} value  */
    function setter(value) {
        let strValue = String(value);
        if (element.type === 'number') {
            const num = parseFloat(strValue);
            if (isNaN(num)) {
                if (element.value !== '') {
                    element.value = '';
                }
                return;
            }
            strValue = num.toString();
        }
        if (element.value !== strValue) {
            element.value = strValue;
        }
    }

    const finalEventName = eventName || (lazy || element.type === 'number' ? 'change' : 'input');

    const inputHandler = debounce(() => {
        const newValue = element.value;
        if (element.type === 'number') {
            const num = parseFloat(newValue);
            reactiveItem.value = isNaN(num) ? 0 : num;
        } else {
            reactiveItem.value = newValue;
        }
    }, debounceTime);

    element.addEventListener(finalEventName, inputHandler);
    setter(reactiveItem.value);

    const storeUnsubscribe = reactiveItem.subscribe(
        _details => {
            if (autoDisconnect && !element.isConnected) {
                cleanup();
                return;
            }
            setter(reactiveItem.value);
        },
        { delay: debounceTime }
    );

    function cleanup() {
        element.removeEventListener(finalEventName, inputHandler);
        storeUnsubscribe();
    }

    const removeAbortListener = attachAbortSignal(signal, cleanup);

    return () => {
        cleanup();
        removeAbortListener();
    };
}

// @ts-check

/**
 * Compares two objects and returns information about their differences.
 * @template {{[key:string]:any}} T
 * @param {T} newObject
 * @param {any} oldObject
 * @param {(a:any, b:any)=>boolean} [customCompareFunction] - Returns true if values are equal.
 * @returns {{[key in keyof T]:boolean}} - true if the property has changed.
 */
function getDiffs(newObject, oldObject, customCompareFunction) {
    /** @type {{[key:string]:boolean}} */
    const result = {};

    for (const prop in newObject) {
        if (oldObject && oldObject.hasOwnProperty(prop)) {
            result[prop] = customCompareFunction
                ? !customCompareFunction(newObject[prop], oldObject[prop])
                : newObject[prop] !== oldObject[prop];
        } else {
            result[prop] = true;
        }
    }

    return /** @type {{[key in keyof T]:boolean}} */ (result);
}

// @ts-check


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

    /** @type {import('./types.d.ts').TypeItemCreator} */
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
     * @param {import('./types.d.ts').TypeItemCreator|null} [createItem]
     * @param {import('./types.d.ts').BindToListOptions & { getKey?: string | ((value: T, index: number) => string | number) }} [options]
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
class ListItemUpdateContext {
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

class ListItemHelper {
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
 * @param {import('./types.d.ts').TypeItemCreator|null} [createItem]
 * @param {import("./types.d.ts").BindToListOptions & { getKey?: string | ((value: T, index: number) => string | number) }} [options={}]
 * @returns {()=>void}
 */
function bindToList(
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

// @ts-check

/**
 * Gets the first element matching a CSS selector and throws if not found.
 * @template {HTMLElement} T
 * @param {string} selector - CSS selector (e.g., '.my-class', '#my-id', '[data-test]').
 * @param {new (...args: any[]) => T} [type] - Optional constructor for type checking.
 * @param {Document|Element} [root=document] - Root element to search within.
 * @returns {T} The element.
 * @throws {Error} If element not found or type mismatch.
 */
function getElement(selector, type, root = document) {
    const el = root.querySelector(selector);
    if (!el) {
        throw new Error(`Element matching "${selector}" not found`);
    }
    if (type && !(el instanceof type)) {
        throw new Error(`Element matching "${selector}" is not of type ${type.name}`);
    }
    return /** @type {T} */ (el);
}

/**
 * Gets an element by ID and throws if not found.
 * @template {HTMLElement} T
 * @param {string} id - Element ID.
 * @param {new (...args: any[]) => T} [type] - Optional constructor for type checking.
 * @param {Document|Element} [root=document] - Root element to search within.
 * @returns {T} The element.
 * @throws {Error} If element not found or type mismatch.
 */
function getElementById(id, type, root = document) {
    return getElement(`#${id}`, type, root);
}

// @ts-check


/**
 * Binds a boolean reactive value to the element's disabled property.
 * @param {HTMLButtonElement|HTMLInputElement|HTMLFieldSetElement|HTMLLinkElement|HTMLOptGroupElement|HTMLOptionElement|HTMLSelectElement|HTMLTextAreaElement|HTMLStyleElement} element - The DOM element.
 * @param {import("@supercat1337/store2").Atom<boolean> | import("@supercat1337/store2").Computed<boolean>} reactiveItem - The reactive item.
 * @param {import("./types.d.ts").BinderOptions} [options={}] - Options.
 * @returns {()=>void}
 */
function bindToDisabled(element, reactiveItem, options = {}) {
    return bindToProperty(/** @type {HTMLElement} */ (element), reactiveItem, 'disabled', options);
}

// @ts-check

/**
 * Two-way binding between a collection of strings and a set of checkboxes with matching values.
 * @param {HTMLInputElement[]} checkboxes - Array of checkbox elements.
 * @param {import("@supercat1337/store2").Collection<string>} collection - The reactive collection.
 * @param {import("./types.d.ts").BinderOptions & { event?: string }} [options={}] - Options.
 * @returns {()=>void}
 */
function bindToCheckboxGroup(checkboxes, collection, options = {}) {
    if (!(collection instanceof Collection)) {
        throw new TypeError('bindToCheckboxGroup expects a Collection<string>');
    }
    if (checkboxes.length === 0) {
        return () => {};
    }

    const _options = Object.assign({}, globalOptions, { event: 'change' }, options);
    const { debounceTime, autoDisconnect, event: eventName, signal } = _options;

    function updateCheckboxes() {
        const selectedValues = collection.value;
        for (let i = 0; i < checkboxes.length; i++) {
            checkboxes[i].checked = selectedValues.indexOf(checkboxes[i].value) !== -1;
        }
    }

    const changeHandler = () => {
        const selected = [];
        for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                selected.push(checkboxes[i].value);
            }
        }
        collection.value = selected;
    };

    // Initial sync
    updateCheckboxes();

    const storeUnsubscribe = collection.subscribe(
        () => {
            if (autoDisconnect && !checkboxes[0]?.isConnected) {
                cleanup();
                return;
            }
            updateCheckboxes();
        },
        { delay: debounceTime }
    );

    for (const cb of checkboxes) {
        cb.addEventListener(eventName, changeHandler);
    }

    function cleanup() {
        for (const cb of checkboxes) {
            cb.removeEventListener(eventName, changeHandler);
        }
        storeUnsubscribe();
    }

    const removeAbortListener = attachAbortSignal(signal, cleanup);
    return () => {
        cleanup();
        removeAbortListener();
    };
}

// @ts-check

/**
 * Two-way binding for a group of radio buttons with a string Atom.
 * @param {HTMLInputElement[]} radios - Array of radio input elements (must share same name).
 * @param {import("@supercat1337/store2").Atom<string>} reactive - The reactive atom.
 * @param {import("./types.d.ts").BinderOptions & { event?: string }} [options={}] - Options (event, debounceTime, autoDisconnect, signal).
 * @returns {()=>void}
 */
function bindToRadioGroup(radios, reactive, options = {}) {
    if (!(reactive instanceof Atom)) {
        throw new TypeError('bindToRadioGroup expects an Atom<string>');
    }

    if (radios.length === 0) {
        return () => {};
    }

    const _options = Object.assign({}, globalOptions, { event: 'change' }, options);
    const { debounceTime, autoDisconnect, event: eventName, signal } = _options;

    const radioName = radios[0].name;
    if (!radioName) {
        return () => {};
    }

    /** @type {Record<string, HTMLInputElement>} */
    const valueToRadio = {};
    for (let i = 0; i < radios.length; i++) {
        const radio = radios[i];
        if (radio.name === radioName && radio.value !== '') {
            valueToRadio[radio.value] = radio;
        }
    }

    /**
     * @param {string} value
     */
    function setter(value) {
        const radio = valueToRadio[value];
        if (radio && !radio.checked) {
            radio.checked = true;
        }
    }

    /** @param {Event} e */
    const changeHandler = e => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        if (target && target.name === radioName) {
            reactive.value = target.value;
        }
    };

    setter(reactive.value);

    for (let i = 0; i < radios.length; i++) {
        radios[i].addEventListener(eventName, changeHandler);
    }

    const storeUnsubscribe = reactive.subscribe(
        _details => {
            if (autoDisconnect && !radios[0]?.isConnected) {
                cleanup();
                return;
            }
            setter(reactive.value);
        },
        { delay: debounceTime }
    );

    function cleanup() {
        for (let i = 0; i < radios.length; i++) {
            radios[i].removeEventListener(eventName, changeHandler);
        }
        storeUnsubscribe();
    }

    const removeAbortListener = attachAbortSignal(signal, cleanup);

    return () => {
        cleanup();
        removeAbortListener();
    };
}

// @ts-check

/**
 * Two-way binding for a multiple-select element with a Collection of strings.
 * @param {HTMLSelectElement} selectElement - The multiple select element.
 * @param {import("@supercat1337/store2").Collection<string>} reactive - The reactive collection.
 * @param {import("./types.d.ts").BinderOptions & { event?: string }} [options={}] - Options.
 * @returns {()=>void}
 */
function bindToSelectMultiple(selectElement, reactive, options = {}) {
    if (!(reactive instanceof Collection)) {
        throw new TypeError('bindToSelectMultiple expects a Collection<string>');
    }
    const _options = Object.assign({}, globalOptions, { event: 'change' }, options);
    const { debounceTime, autoDisconnect, event: eventName, signal } = _options;

    function updateSelectedOptions() {
        const selectedValues = reactive.value;
        const options = selectElement.options;
        for (let i = 0; i < options.length; i++) {
            options[i].selected = selectedValues.indexOf(options[i].value) !== -1;
        }
    }

    const changeHandler = () => {
        const selected = [];
        for (let i = 0; i < selectElement.options.length; i++) {
            if (selectElement.options[i].selected) {
                selected.push(selectElement.options[i].value);
            }
        }
        reactive.value = selected;
    };

    // Initial sync
    updateSelectedOptions();

    selectElement.addEventListener(eventName, changeHandler);

    const storeUnsubscribe = reactive.subscribe(
        () => {
            if (autoDisconnect && !selectElement.isConnected) {
                cleanup();
                return;
            }
            updateSelectedOptions();
        },
        { delay: debounceTime }
    );

    function cleanup() {
        selectElement.removeEventListener(eventName, changeHandler);
        storeUnsubscribe();
    }

    const removeAbortListener = attachAbortSignal(signal, cleanup);
    return () => {
        cleanup();
        removeAbortListener();
    };
}

// @ts-check

/**
 * Two-way binding for a single-select element with a string Atom.
 * @param {HTMLSelectElement} selectElement - The select element.
 * @param {import("@supercat1337/store2").Atom<string>} reactive - The reactive atom.
 * @param {import("./types.d.ts").BinderOptions & { event?: string }} [options={}] - Options (event, debounceTime, autoDisconnect, signal).
 * @returns {()=>void}
 */
function bindToSelect(selectElement, reactive, options = {}) {
    if (!(reactive instanceof Atom)) {
        throw new TypeError('bindToSelect expects an Atom<string>');
    }

    const _options = Object.assign({}, globalOptions, { event: 'change' }, options);
    const { debounceTime, autoDisconnect, event: eventName, signal } = _options;

    /** @param {string} value  */
    function setter(value) {
        selectElement.value = value;
    }

    setter(reactive.value);

    const callback = () => {
        reactive.value = selectElement.value;
    };

    selectElement.addEventListener(eventName, callback);

    const storeUnsubscribe = reactive.subscribe(
        _details => {
            if (autoDisconnect && !selectElement.isConnected) {
                cleanup();
                return;
            }
            setter(reactive.value);
        },
        { delay: debounceTime }
    );

    function cleanup() {
        selectElement.removeEventListener(eventName, callback);
        storeUnsubscribe();
    }

    const removeAbortListener = attachAbortSignal(signal, cleanup);

    return () => {
        cleanup();
        removeAbortListener();
    };
}

// @ts-check


/**
 * Setter for style binding. Supports string (cssText) or object.
 * @param {import("@supercat1337/store2").Atom<string|Record<string,string>> | import("@supercat1337/store2").Computed<string|Record<string,string>>} reactiveItem
 * @param {HTMLElement} element
 */
function setter$2(reactiveItem, element) {
    const value = reactiveItem.value;
    if (typeof value === 'string') {
        element.style.cssText = value;
    } else if (value && typeof value === 'object') {
        // Clear all existing inline styles
        element.style.cssText = '';
        // Apply new styles
        Object.assign(element.style, value);
    }
}

/**
 * Binds a reactive string or style object to the element's style.
 * @param {HTMLElement} element - The DOM element.
 * @param {import("@supercat1337/store2").Atom<string|Record<string,string>> | import("@supercat1337/store2").Computed<string|Record<string,string>>} reactiveItem - The reactive item.
 * @param {import("./types.d.ts").BinderOptions} [options={}] - Options.
 * @returns {()=>void}
 */
function bindToStyle(element, reactiveItem, options = {}) {
    const _options = Object.assign({}, globalOptions, options);
    return binder(element, reactiveItem, setter$2, {}, _options);
}

// @ts-check


/**
 * Setter for dataset binding. Expects an object; each key becomes a data-* attribute.
 * @param {import("@supercat1337/store2").Atom<Record<string,string>> | import("@supercat1337/store2").Computed<Record<string,string>>} reactiveItem
 * @param {HTMLElement} element
 */
function setter$1(reactiveItem, element) {
    const data = reactiveItem.value;
    if (data && typeof data === 'object') {
        // Remove old data-* attributes not present in new object
        for (const attr of element.getAttributeNames()) {
            if (attr.startsWith('data-')) {
                const key = attr.slice(5);
                if (!(key in data)) {
                    element.removeAttribute(attr);
                }
            }
        }
        // Set new ones
        for (const [key, value] of Object.entries(data)) {
            element.dataset[key] = value;
        }
    } else if (data == null) {
        // Remove all data-* attributes
        for (const attr of element.getAttributeNames()) {
            if (attr.startsWith('data-')) {
                element.removeAttribute(attr);
            }
        }
    }
}

/**
 * Binds a reactive object to the element's dataset (data-* attributes).
 * The reactive item must provide an object where keys map to data-* attribute names.
 * @param {HTMLElement} element - The DOM element.
 * @param {import("@supercat1337/store2").Atom<Record<string,string>> | import("@supercat1337/store2").Computed<Record<string,string>>} reactiveItem - The reactive item (object).
 * @param {import("./types.d.ts").BinderOptions} [options={}] - Options.
 * @returns {()=>void}
 */
function bindToDataset(element, reactiveItem, options = {}) {
    const _options = Object.assign({}, globalOptions, options);
    return binder(element, reactiveItem, setter$1, {}, _options);
}

// @ts-check


/**
 * Setter for textContent binding.
 * @param {import("@supercat1337/store2").Atom<string|number> | import("@supercat1337/store2").Computed<string|number>} reactiveItem
 * @param {HTMLElement|Text} element
 */
function setter(reactiveItem, element) {
    element.textContent = String(reactiveItem.value);
}

/**
 * Binds a reactive string/number value to the element's textContent.
 * @param {HTMLElement|Text} element - The DOM element or text node.
 * @param {import("@supercat1337/store2").Atom<string|number> | import("@supercat1337/store2").Computed<string|number>} reactiveItem - The reactive item.
 * @param {import("./types.d.ts").BinderOptions} [options={}] - Options.
 * @returns {()=>void}
 */
function bindToText(element, reactiveItem, options = {}) {
    const _options = Object.assign({}, globalOptions, options);
    const { debounceTime, autoDisconnect, signal } = _options;

    setter(reactiveItem, element);

    const unsubscribe = reactiveItem.subscribe(_details => {
        if (autoDisconnect && !element.isConnected) {
            unsubscribe();
            return;
        }
        setter(reactiveItem, element);
    }, {delay: debounceTime});

    const removeAbortListener = attachAbortSignal(signal, unsubscribe);

    return () => {
        unsubscribe();
        removeAbortListener();
    };
}

export { ListItemHelper, ListItemUpdateContext, bindToAttribute, bindToCheckbox, bindToCheckboxGroup, bindToClassString, bindToCssClass, bindToDataset, bindToDisabled, bindToHtml, bindToInput, bindToList, bindToProperty, bindToRadioGroup, bindToSelect, bindToSelectMultiple, bindToShow, bindToStyle, bindToText, getDiffs, getElement, getElementById, globalOptions };
