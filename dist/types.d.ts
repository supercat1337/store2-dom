import { Atom, Collection, Computed, ReactiveItem } from '@supercat1337/store2';

// ========== Options ==========
export interface BinderOptions {
    /** Debounce time in milliseconds for the subscription (default 0) */
    debounceTime?: number;
    /** Automatically disconnect when element is removed from DOM (default false) */
    autoDisconnect?: boolean;
    /**
     * AbortSignal that will trigger automatic unbinding when aborted.
     * Useful for component lifecycle integration.
     */
    signal?: AbortSignal;
}

export interface AttributeBindingOptions extends BinderOptions {
    attributeName?: string;
}

export interface TwoWayBindingOptions extends BinderOptions {
    /** For input bindings: if true, updates on "change" instead of "input" (default false) */
    lazy?: boolean;
    /** Custom event name (e.g., 'change', 'input'). Overrides lazy inference. */
    event?: string;
}

export interface CssClassBindingOptions extends BinderOptions {
    /** If true, toggles class opposite to the reactive value (default false) */
    invert?: boolean;
}

export interface ShowBindingOptions extends BinderOptions {
    /** CSS class used to hide element (default "d-none") */
    hideClassName?: string;
    /** If true, inverts the logic: class added when value is true (default false) */
    invert?: boolean;
}

export interface BindToListOptions extends BinderOptions {
    autoDisconnect?: boolean;
    /**
     * Optional function or property name to generate a stable key for each item.
     * - If a string is provided, it is used as the property name (e.g., 'id').
     * - If a function is provided, it is called with (value, index) and should return a string or number.
     * The key is stored as `data-key` on each item element and is also available in ListItemUpdateContext.key.
     */
    getKey?: string | ((value: any, index: number) => string | number);
}

// ========== List helpers ==========

export type TypeItemCreator = (listItemHelper: ListItemHelper) => HTMLElement;

/* From globalOptions.d.ts */
/**
 * Global options for the binders.
 */
export type GlobalOptions = {
    /**
     * the default debounce time for all the binders
     */
    debounceTime?: number | undefined;
    /**
     * whether to automatically disconnect the subscriptions
     * when the element is removed from the DOM
     */
    autoDisconnect?: boolean | undefined;
};
export namespace globalOptions {
    let debounceTime: number;
    let autoDisconnect: boolean;
}

/* From element-binders\attribute.d.ts */
/**
 * Binds a reactive value to an element's attribute. If value is null, attribute is removed.
 * @param {HTMLElement} element - The DOM element.
 * @param {Atom<string|null> | Computed<string|null>} reactiveItem - The reactive item.
 * @param {string} attributeName - Name of the attribute.
 * @param {AttributeBindingOptions} [options={}] - Options.
 * @returns {()=>void}
 */
export function bindToAttribute(element: HTMLElement, reactiveItem: Atom<string | null> | Computed<string | null>, attributeName: string, options?: AttributeBindingOptions): () => void;

/* From element-binders\binder.d.ts */
/**
 * Binds a reactive item to an element using a custom setter function.
 * @template T
 * @template {object} C
 * @param {HTMLElement} element - The DOM element.
 * @param {Atom<T> | Computed<T>} reactiveItem - The reactive item.
 * @param {(reactiveItem: Atom<T> | Computed<T>, element: HTMLElement, ctx: C, options: BinderOptions) => void} setter - Function that updates the element.
 * @param {C} [ctx] - Optional context object passed to setter.
 * @param {BinderOptions} [options={}] - Options (debounceTime, autoDisconnect, signal).
 * @returns {()=>void}
 */
export function binder<T, C extends object>(element: HTMLElement, reactiveItem: Atom<T> | Computed<T>, setter: (reactiveItem: Atom<T> | Computed<T>, element: HTMLElement, ctx: C, options: BinderOptions) => void, ctx?: C, options?: BinderOptions): () => void;

/* From element-binders\checkboxes-values.d.ts */
/**
 * Two-way binding between a collection of strings and a set of checkboxes with matching values.
 * @param {HTMLInputElement[]} checkboxes - Array of checkbox elements.
 * @param {Collection<string>} collection - The reactive collection.
 * @param {BinderOptions & { event?: string }} [options={}] - Options.
 * @returns {()=>void}
 */
export function bindToCheckboxGroup(checkboxes: HTMLInputElement[], collection: Collection<string>, options?: BinderOptions & {
    event?: string;
}): () => void;

/* From element-binders\className.d.ts */
/**
 * Binds a reactive string value to the element's className property.
 * @param {HTMLElement} element - The DOM element.
 * @param {Atom<string> | Computed<string>} reactiveItem - The reactive item.
 * @param {BinderOptions} [options={}] - Options.
 * @returns {()=>void}
 */
export function bindToClassString(element: HTMLElement, reactiveItem: Atom<string> | Computed<string>, options?: BinderOptions): () => void;

/* From element-binders\css-class.d.ts */
/**
 * Binds a boolean reactive value to a CSS class presence (toggles the class).
 * @param {HTMLElement} element - The DOM element.
 * @param {Atom<boolean> | Computed<boolean>} reactiveItem - The reactive item.
 * @param {string} cssClassName - The CSS class name to toggle.
 * @param {CssClassBindingOptions} [options={}] - Options (invert, debounceTime, autoDisconnect).
 * @returns {()=>void}
 */
export function bindToCssClass(element: HTMLElement, reactiveItem: Atom<boolean> | Computed<boolean>, cssClassName: string, options?: CssClassBindingOptions): () => void;

/* From element-binders\dataset.d.ts */
/**
 * Binds a reactive object to the element's dataset (data-* attributes).
 * The reactive item must provide an object where keys map to data-* attribute names.
 * @param {HTMLElement} element - The DOM element.
 * @param {Atom<Record<string,string>> | Computed<Record<string,string>>} reactiveItem - The reactive item (object).
 * @param {BinderOptions} [options={}] - Options.
 * @returns {()=>void}
 */
export function bindToDataset(element: HTMLElement, reactiveItem: Atom<Record<string, string>> | Computed<Record<string, string>>, options?: BinderOptions): () => void;

/* From element-binders\disabled.d.ts */
/**
 * Binds a boolean reactive value to the element's disabled property.
 * @param {HTMLButtonElement|HTMLInputElement|HTMLFieldSetElement|HTMLLinkElement|HTMLOptGroupElement|HTMLOptionElement|HTMLSelectElement|HTMLTextAreaElement|HTMLStyleElement} element - The DOM element.
 * @param {Atom<boolean> | Computed<boolean>} reactiveItem - The reactive item.
 * @param {BinderOptions} [options={}] - Options.
 * @returns {()=>void}
 */
export function bindToDisabled(element: HTMLButtonElement | HTMLInputElement | HTMLFieldSetElement | HTMLLinkElement | HTMLOptGroupElement | HTMLOptionElement | HTMLSelectElement | HTMLTextAreaElement | HTMLStyleElement, reactiveItem: Atom<boolean> | Computed<boolean>, options?: BinderOptions): () => void;

/* From element-binders\html.d.ts */
/**
 * Binds a reactive string/number value to the element's innerHTML.
 * @param {HTMLElement} element - The DOM element.
 * @param {Atom<string|number> | Computed<string|number>} reactiveItem - The reactive item.
 * @param {BinderOptions} [options={}] - Options.
 * @returns {()=>void}
 */
export function bindToHtml(element: HTMLElement, reactiveItem: Atom<string | number> | Computed<string | number>, options?: BinderOptions): () => void;

/* From element-binders\list.d.ts */
/**
 * Binds a reactive array to a list element.
 * @template T
 * @param {HTMLElement} listElement
 * @param {ReactiveItem & { value: T[] }} reactiveItem
 * @param {(listItemHelper:ListItemHelper, details:ListItemUpdateContext<T>) => void} onUpdateItem
 * @param {TypeItemCreator|null} [createItem]
 * @param {BindToListOptions & { getKey?: string | ((value: T, index: number) => string | number) }} [options={}]
 * @returns {()=>void}
 */
export function bindToList<T>(listElement: HTMLElement, reactiveItem: ReactiveItem & {
    value: T[];
}, onUpdateItem: (listItemHelper: ListItemHelper, details: ListItemUpdateContext<T>) => void, createItem?: TypeItemCreator | null, options?: BindToListOptions & {
    getKey?: string | ((value: T, index: number) => string | number);
}): () => void;
/**
 * @template T
 */
export class ListItemUpdateContext<T> {
    /**
     * @param {HTMLElement} itemElement
     * @param {number} index
     * @param {T} value
     * @param {any} oldValue
     * @param {number} length
     * @param {string|number|undefined} key
     */
    constructor(itemElement: HTMLElement, index: number, value: T, oldValue: any, length: number, key: string | number | undefined);
    /** @type {HTMLElement} */
    itemElement: HTMLElement;
    /** @type {number} */
    index: number;
    /** @type {T} */
    value: T;
    /** @type {any} */
    oldValue: any;
    /** @type {number} */
    length: number;
    /** @type {string|number|undefined} */
    key: string | number | undefined;
}
export class ListItemHelper {
    /**
     * @param {HTMLElement} [templateElement]
     */
    constructor(templateElement?: HTMLElement);
    /**
     * @returns {boolean}
     */
    hasTemplate(): boolean;
    /**
     * @returns {HTMLElement|null}
     */
    getTemplate(): HTMLElement | null;
    /**
     * @param {HTMLElement} element
     * @returns {number}
     */
    getListItemIndex(element: HTMLElement): number;
    /**
     * @param {HTMLElement} element
     * @param {string} [attrName]
     * @returns {HTMLElement|null}
     */
    getListItem(element: HTMLElement, attrName?: string): HTMLElement | null;
    /**
     * @template {{[key:string]:any}} T
     * @param {T} newObject
     * @param {any} oldObject
     * @param {(a:any, b:any)=>boolean} [customCompareFunction]
     * @returns {{[key in keyof T]:boolean}}
     */
    getDiffs<T extends {
        [key: string]: any;
    }>(newObject: T, oldObject: any, customCompareFunction?: (a: any, b: any) => boolean): { [key in keyof T]: boolean; };

}

/* From element-binders\property.d.ts */
/**
 * Binds a reactive value to an element's DOM property.
 * @template T
 * @param {HTMLElement} element - The DOM element.
 * @param {Atom<T> | Computed<T>} reactiveItem - The reactive item.
 * @param {string} propertyName - Name of the property (e.g., 'innerHTML', 'className').
 * @param {BinderOptions} [options={}] - Options.
 * @returns {()=>void}
 */
export function bindToProperty<T>(element: HTMLElement, reactiveItem: Atom<T> | Computed<T>, propertyName: string, options?: BinderOptions): () => void;

/* From element-binders\show.d.ts */
/**
 * Binds a boolean reactive value to element visibility using a CSS class.
 * The class (by default "d-none") is added when reactive value is false,
 * and removed when true.
 * @param {HTMLElement} element - The DOM element.
 * @param {Atom<boolean> | Computed<boolean>} reactiveItem - The reactive item.
 * @param {ShowBindingOptions} [options={}] - Options (hideClassName, invert, debounceTime, autoDisconnect).
 *   - invert: if true, the class is added when reactive value is true (rarely needed).
 * @returns {()=>void}
 */
export function bindToShow(element: HTMLElement, reactiveItem: Atom<boolean> | Computed<boolean>, options?: ShowBindingOptions): () => void;

/* From element-binders\style.d.ts */
/**
 * Binds a reactive string or style object to the element's style.
 * @param {HTMLElement} element - The DOM element.
 * @param {Atom<string|Record<string,string>> | Computed<string|Record<string,string>>} reactiveItem - The reactive item.
 * @param {BinderOptions} [options={}] - Options.
 * @returns {()=>void}
 */
export function bindToStyle(element: HTMLElement, reactiveItem: Atom<string | Record<string, string>> | Computed<string | Record<string, string>>, options?: BinderOptions): () => void;

/* From element-binders\text.d.ts */
/**
 * Binds a reactive string/number value to the element's textContent.
 * @param {HTMLElement|Text} element - The DOM element or text node.
 * @param {Atom<string|number> | Computed<string|number>} reactiveItem - The reactive item.
 * @param {BinderOptions} [options={}] - Options.
 * @returns {()=>void}
 */
export function bindToText(element: HTMLElement | Text, reactiveItem: Atom<string | number> | Computed<string | number>, options?: BinderOptions): () => void;

/* From utils\abort-helper.d.ts */
/**
 * Attaches an abort handler to an AbortSignal that calls the provided cleanup function when aborted.
 * If the signal is already aborted, cleanup is called immediately.
 *
 * @param {AbortSignal | undefined} signal - The abort signal (optional).
 * @param {() => void} cleanup - The cleanup function to call on abort.
 * @returns {() => void} - A function to remove the abort listener (no-op if signal not provided or already aborted).
 */
export function attachAbortSignal(signal: AbortSignal | undefined, cleanup: () => void): () => void;

/* From utils\getElement.d.ts */
/**
 * Gets the first element matching a CSS selector and throws if not found.
 * @template {HTMLElement} T
 * @param {string} selector - CSS selector (e.g., '.my-class', '#my-id', '[data-test]').
 * @param {new (...args: any[]) => T} [type] - Optional constructor for type checking.
 * @param {Document|Element} [root=document] - Root element to search within.
 * @returns {T} The element.
 * @throws {Error} If element not found or type mismatch.
 */
export function getElement<T extends HTMLElement>(selector: string, type?: new (...args: any[]) => T, root?: Document | Element): T;
/**
 * Gets an element by ID and throws if not found.
 * @template {HTMLElement} T
 * @param {string} id - Element ID.
 * @param {new (...args: any[]) => T} [type] - Optional constructor for type checking.
 * @param {Document|Element} [root=document] - Root element to search within.
 * @returns {T} The element.
 * @throws {Error} If element not found or type mismatch.
 */
export function getElementById<T extends HTMLElement>(id: string, type?: new (...args: any[]) => T, root?: Document | Element): T;

/* From utils\helpers.d.ts */
/**
 * Compares two objects and returns information about their differences.
 * @template {{[key:string]:any}} T
 * @param {T} newObject
 * @param {any} oldObject
 * @param {(a:any, b:any)=>boolean} [customCompareFunction] - Returns true if values are equal.
 * @returns {{[key in keyof T]:boolean}} - true if the property has changed.
 */
export function getDiffs<T extends {
    [key: string]: any;
}>(newObject: T, oldObject: any, customCompareFunction?: (a: any, b: any) => boolean): { [key in keyof T]: boolean; };

/* From element-binders\two-way-bindings\checkbox-checked.d.ts */
/**
 * Two-way binding between a checkbox and a boolean Atom.
 * @param {HTMLInputElement} checkbox - The checkbox element.
 * @param {Atom<boolean>} reactiveItem - The reactive boolean atom.
 * @param {BinderOptions & { event?: string }} [options={}] - Options (event, debounceTime, autoDisconnect, signal).
 * @returns {()=>void}
 */
export function bindToCheckbox(checkbox: HTMLInputElement, reactiveItem: Atom<boolean>, options?: BinderOptions & {
    event?: string;
}): () => void;

/* From element-binders\two-way-bindings\input-value.d.ts */
/**
 * Two-way binding between an input/textarea and a string/number Atom.
 * @param {HTMLInputElement|HTMLTextAreaElement} element - The input or textarea element.
 * @param {Atom<string|number>} reactiveItem - The reactive atom.
 * @param {TwoWayBindingOptions & { event?: string }} [options={}] - Options (lazy, event, debounceTime, autoDisconnect, signal).
 * @returns {()=>void}
 */
export function bindToInput(element: HTMLInputElement | HTMLTextAreaElement, reactiveItem: Atom<string | number>, options?: TwoWayBindingOptions & {
    event?: string;
}): () => void;

/* From element-binders\two-way-bindings\multiple-select.d.ts */
/**
 * Two-way binding for a multiple-select element with a Collection of strings.
 * @param {HTMLSelectElement} selectElement - The multiple select element.
 * @param {Collection<string>} reactive - The reactive collection.
 * @param {BinderOptions & { event?: string }} [options={}] - Options.
 * @returns {()=>void}
 */
export function bindToSelectMultiple(selectElement: HTMLSelectElement, reactive: Collection<string>, options?: BinderOptions & {
    event?: string;
}): () => void;

/* From element-binders\two-way-bindings\radios.d.ts */
/**
 * Two-way binding for a group of radio buttons with a string Atom.
 * @param {HTMLInputElement[]} radios - Array of radio input elements (must share same name).
 * @param {Atom<string>} reactive - The reactive atom.
 * @param {BinderOptions & { event?: string }} [options={}] - Options (event, debounceTime, autoDisconnect, signal).
 * @returns {()=>void}
 */
export function bindToRadioGroup(radios: HTMLInputElement[], reactive: Atom<string>, options?: BinderOptions & {
    event?: string;
}): () => void;

/* From element-binders\two-way-bindings\select.d.ts */
/**
 * Two-way binding for a single-select element with a string Atom.
 * @param {HTMLSelectElement} selectElement - The select element.
 * @param {Atom<string>} reactive - The reactive atom.
 * @param {BinderOptions & { event?: string }} [options={}] - Options (event, debounceTime, autoDisconnect, signal).
 * @returns {()=>void}
 */
export function bindToSelect(selectElement: HTMLSelectElement, reactive: Atom<string>, options?: BinderOptions & {
    event?: string;
}): () => void;
