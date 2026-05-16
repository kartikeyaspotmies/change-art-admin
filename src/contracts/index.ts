/**
 * Public barrel for the shared contracts layer.
 *
 * Modules import from `@contracts` only — never reach into `@contracts/enums`
 * or `@contracts/interfaces` directly when this barrel covers the surface.
 */

export * from './enums';
export * from './interfaces';
export * from './events';
export * from './error-codes';
