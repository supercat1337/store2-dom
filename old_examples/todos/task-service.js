// @ts-check

/** @typedef {{task_id: string; text:string; done:boolean}} ItemData */

class TaskService {
    #max_id = 0;
    /** @type {Map<string, ItemData>} */
    #tasks = new Map();

    /**
     * @param {{text:string; done:boolean}} data
     * @returns {Promise<ItemData>}
     */
    async add(data) {
        const task_id = String(++this.#max_id);
        const value = { ...data, task_id };
        this.#tasks.set(task_id, value);
        return value;
    }

    /**
     * @returns {Promise<ItemData[]>}
     */
    async requestData() {
        return Array.from(this.#tasks.values());
    }

    /**
     * @param {string} task_id
     * @returns {Promise<boolean>}
     */
    async delete(task_id) {
        return this.#tasks.delete(task_id);
    }

    /**
     * @param {ItemData} task
     * @returns {Promise<void>}
     */
    async update(task) {
        if (this.#tasks.has(task.task_id)) {
            this.#tasks.set(task.task_id, task);
        }
    }
}

const tasks_service = new TaskService();
globalThis.tasks_service = tasks_service;

// Pre-populate with 50 items
for (let i = 1; i <= 50; i++) {
    await tasks_service.add({ text: `item ${i}`, done: false });
}

export { tasks_service };
