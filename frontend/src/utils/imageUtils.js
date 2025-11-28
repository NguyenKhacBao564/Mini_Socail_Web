/**
 * Helper to resolve image URLs.
 * - Returns absolute URLs as is.
 * - Returns blob URLs as is.
 * - Prepends API base URL to relative paths.
 * - Returns a default placeholder if null/undefined (optional, currently returns empty string).
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  // Prepend local API base if it's a relative path
  const API_BASE = 'http://localhost:3000';
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
};