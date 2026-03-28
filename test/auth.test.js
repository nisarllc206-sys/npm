'use strict';

const { describe, it, mock, before, after } = require('node:test');
const assert = require('node:assert/strict');

// Minimal stubs for Firebase auth SDK functions
const mockAuth = { currentUser: null };
const mockUserCredential = { user: { uid: 'test-uid', email: 'test@example.com' } };
const mockUnsubscribe = () => {};

const firebaseAuthStubs = {
  getAuth: mock.fn(() => mockAuth),
  createUserWithEmailAndPassword: mock.fn(async () => mockUserCredential),
  signInWithEmailAndPassword: mock.fn(async () => mockUserCredential),
  signOut: mock.fn(async () => {}),
  onAuthStateChanged: mock.fn(() => mockUnsubscribe),
};

// Use module mocking via require cache manipulation
const Module = require('node:module');
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'firebase/auth') {
    return firebaseAuthStubs;
  }
  return originalLoad.apply(this, arguments);
};

const { signUp, signIn, logOut, getCurrentUser, onAuthChange } = require('../src/auth');

// Restore after loading
Module._load = originalLoad;

const mockApp = {};

describe('auth module', () => {
  it('signUp calls createUserWithEmailAndPassword with correct args', async () => {
    firebaseAuthStubs.getAuth.mock.resetCalls();
    firebaseAuthStubs.createUserWithEmailAndPassword.mock.resetCalls();

    const result = await signUp(mockApp, 'user@example.com', 'secret123');

    assert.equal(firebaseAuthStubs.getAuth.mock.calls.length, 1);
    assert.equal(firebaseAuthStubs.createUserWithEmailAndPassword.mock.calls.length, 1);
    assert.deepEqual(
      firebaseAuthStubs.createUserWithEmailAndPassword.mock.calls[0].arguments,
      [mockAuth, 'user@example.com', 'secret123'],
    );
    assert.deepEqual(result, mockUserCredential);
  });

  it('signIn calls signInWithEmailAndPassword with correct args', async () => {
    firebaseAuthStubs.getAuth.mock.resetCalls();
    firebaseAuthStubs.signInWithEmailAndPassword.mock.resetCalls();

    const result = await signIn(mockApp, 'user@example.com', 'secret123');

    assert.equal(firebaseAuthStubs.getAuth.mock.calls.length, 1);
    assert.equal(firebaseAuthStubs.signInWithEmailAndPassword.mock.calls.length, 1);
    assert.deepEqual(
      firebaseAuthStubs.signInWithEmailAndPassword.mock.calls[0].arguments,
      [mockAuth, 'user@example.com', 'secret123'],
    );
    assert.deepEqual(result, mockUserCredential);
  });

  it('logOut calls signOut', async () => {
    firebaseAuthStubs.getAuth.mock.resetCalls();
    firebaseAuthStubs.signOut.mock.resetCalls();

    await logOut(mockApp);

    assert.equal(firebaseAuthStubs.signOut.mock.calls.length, 1);
    assert.deepEqual(
      firebaseAuthStubs.signOut.mock.calls[0].arguments,
      [mockAuth],
    );
  });

  it('getCurrentUser returns auth.currentUser', () => {
    mockAuth.currentUser = { uid: 'abc', email: 'a@b.com' };
    const user = getCurrentUser(mockApp);
    assert.deepEqual(user, { uid: 'abc', email: 'a@b.com' });
    mockAuth.currentUser = null;
  });

  it('onAuthChange calls onAuthStateChanged and returns unsubscribe', () => {
    firebaseAuthStubs.onAuthStateChanged.mock.resetCalls();

    const cb = () => {};
    const unsub = onAuthChange(mockApp, cb);

    assert.equal(firebaseAuthStubs.onAuthStateChanged.mock.calls.length, 1);
    assert.deepEqual(
      firebaseAuthStubs.onAuthStateChanged.mock.calls[0].arguments,
      [mockAuth, cb],
    );
    assert.equal(unsub, mockUnsubscribe);
  });
});
