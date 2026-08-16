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
     * Function to create a new item element.
     * Receives a ListItemHelper instance for convenience.
     * If provided, it takes precedence over `template`.
     */
    createItem?: (helper: ListItemHelper) => HTMLElement;
    /**
     * Template element or CSS selector for creating new items.
     * - If an HTMLElement is given, it is cloned for each item.
     * - If a string is given, it is used as a selector inside the list container.
     * - If a <template> element is given, its content is cloned.
     * - If a <template> is given as selector, it must point to a <template> element.
     */
    template?: HTMLElement | string;
    /**
     * Optional function or property name to generate a stable key for each item.
     * - If a string is provided, it is used as the property name (e.g., 'id').
     * - If a function is provided, it is called with (value, index) and should return a string or number.
     * The key is stored as `data-key` on each item element and is also available in ListItemUpdateContext.key.
     */
    getKey?: string | ((value: any, index: number) => string | number);
    /**
     * Called before an item is removed from the list.
     * @param itemElement - The DOM element being removed.
     * @param value - The item value.
     * @param index - The index of the item.
     */
    onRemoveItem?: (itemElement: HTMLElement, value: any, index: number) => void;
}

// ========== List helpers ==========

export type TypeItemCreator = (listItemHelper: ListItemHelper) => HTMLElement;
