// tests/unit/utils/abort-helper.test.js
import test from 'ava';
import { attachAbortSignal } from '../../../src/utils/abort-helper.js';

test('attachAbortSignal calls cleanup when signal aborts', t => {
    const controller = new AbortController();
    let called = 0;
    const cleanup = () => called++;
    const remove = attachAbortSignal(controller.signal, cleanup);
    t.is(called, 0);
    controller.abort();
    t.is(called, 1);
    remove();
});

test('attachAbortSignal calls cleanup immediately if signal already aborted', t => {
    const controller = new AbortController();
    controller.abort();
    let called = 0;
    const cleanup = () => called++;
    const remove = attachAbortSignal(controller.signal, cleanup);
    t.is(called, 1);
    remove();
});

test('attachAbortSignal returns no-op if signal is undefined', t => {
    let called = 0;
    const cleanup = () => called++;
    const remove = attachAbortSignal(undefined, cleanup);
    t.is(called, 0);
    remove();
});

test('attachAbortSignal removes abort listener when returned function is called', t => {
    const controller = new AbortController();
    let called = 0;
    const cleanup = () => called++;
    const remove = attachAbortSignal(controller.signal, cleanup);
    remove();
    controller.abort();
    t.is(called, 0);
});
