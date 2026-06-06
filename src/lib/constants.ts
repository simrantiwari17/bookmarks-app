/** Handles that collide with app routes or reserved paths. */
export const RESERVED_HANDLES = new Set([
  'login',
  'signup',
  'dashboard',
  'setup-profile',
  'api',
  'auth',
  'admin',
  '_next',
  'favicon.ico',
]);

export function isReservedHandle(handle: string): boolean {
  return RESERVED_HANDLES.has(handle.toLowerCase());
}
