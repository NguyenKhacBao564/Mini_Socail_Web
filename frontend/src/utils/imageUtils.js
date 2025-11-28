/**
 * Helper to resolve image URLs.
 * - Returns absolute URLs as is.
 * - Prepends API base URL to relative paths.
 * - Returns a default placeholder if null/undefined (optional, currently returns empty string).
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Prepend local API base if it's a relative path
  // Ensure we don't double slashes if path already has one, though typical concatenation handles it if we are careful.
  // Assuming API Gateway serves static files for legacy paths at root or via specific route? 
  // The prompt implies legacy paths start with /
  const API_BASE = 'http://localhost:3000';
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
};
