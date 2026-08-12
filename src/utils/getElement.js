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
export function getElement(selector, type, root = document) {
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
export function getElementById(id, type, root = document) {
    return getElement(`#${id}`, type, root);
}
