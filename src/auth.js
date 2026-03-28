'use strict';

const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} = require('firebase/auth');

/**
 * Register a new user with email and password.
 *
 * @param {import('firebase/app').FirebaseApp} app - Initialized Firebase app instance.
 * @param {string} email - User's email address.
 * @param {string} password - User's password.
 * @returns {Promise<import('firebase/auth').UserCredential>} The created user credential.
 */
async function signUp(app, email, password) {
  const auth = getAuth(app);
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Sign in an existing user with email and password.
 *
 * @param {import('firebase/app').FirebaseApp} app - Initialized Firebase app instance.
 * @param {string} email - User's email address.
 * @param {string} password - User's password.
 * @returns {Promise<import('firebase/auth').UserCredential>} The signed-in user credential.
 */
async function signIn(app, email, password) {
  const auth = getAuth(app);
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out the currently authenticated user.
 *
 * @param {import('firebase/app').FirebaseApp} app - Initialized Firebase app instance.
 * @returns {Promise<void>}
 */
async function logOut(app) {
  const auth = getAuth(app);
  return signOut(auth);
}

/**
 * Get the currently signed-in user, or null if no user is signed in.
 *
 * @param {import('firebase/app').FirebaseApp} app - Initialized Firebase app instance.
 * @returns {import('firebase/auth').User|null} The current user, or null.
 */
function getCurrentUser(app) {
  const auth = getAuth(app);
  return auth.currentUser;
}

/**
 * Subscribe to authentication state changes.
 *
 * @param {import('firebase/app').FirebaseApp} app - Initialized Firebase app instance.
 * @param {function(import('firebase/auth').User|null): void} callback - Called with the user (or null) on each auth state change.
 * @returns {function(): void} Unsubscribe function to stop listening.
 */
function onAuthChange(app, callback) {
  const auth = getAuth(app);
  return onAuthStateChanged(auth, callback);
}

module.exports = { signUp, signIn, logOut, getCurrentUser, onAuthChange };
