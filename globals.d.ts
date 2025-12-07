// This file provides type definitions for modules and globals that are
// available in the browser environment but not explicitly declared in
// the project's own source code. This helps TypeScript understand the
// overall project structure and avoids false-positive errors in the editor.

// Informs TypeScript that these modules are loaded via an importmap in
// index.html at runtime. This prevents "Cannot find module" errors.
declare module '@google/genai';
declare module 'marked';

// Declares the global `process` variable that is created in `env.js`.
// This allows the use of `process.env.API_KEY` without TypeScript
// complaining that it cannot find the name 'process'.
// FIX: To avoid "Cannot redeclare block-scoped variable" errors,
// this file is converted to a module that augments the global scope.
// By augmenting the NodeJS namespace, we avoid redeclaring `process` if
// it's already defined by @types/node, which is a common source of conflict.
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
    }
  }
}

export {};


