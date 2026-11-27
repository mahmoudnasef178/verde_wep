/**
 * Single source of truth for Meta Catalog Feed <g:id> and Pixel/CAPI content_ids.
 * Must stay identical to Verde_Api/src/lib/meta-ids.js.
 *
 * - Discover Boxes (single variant)   -> String(product.slug)
 * - 10 ML perfume variant             -> `${String(product.slug)}-10ml`
 * - 50 ML perfume variant (default)   -> `${String(product.slug)}-50ml`
 *   (also returned when size is missing/undefined/empty — treated as default 50 ML)
 * - Missing slug                      -> ''
 */
export function toContentId(product, size) {
  if (!product) return '';
  const slug = String(product.slug || '').trim().toLowerCase();
  if (!slug) {
    console.warn('[toContentId] ⚠️ Product has no slug — returning empty string. Product:', product.name || product._id || 'unknown');
    return '';
  }

  const isDiscover =
    slug === 'discover-box' ||
    slug === 'winter-discover-box' ||
    slug.includes('discover');

  if (isDiscover) return slug;

  // If size is missing/undefined/empty, treat as default 50 ML
  const normalizedSize =
    typeof size === 'string' ? size.toLowerCase().replace(/\s+/g, '') : '';
  const is10ml = normalizedSize.includes('10ml');

  return is10ml ? `${slug}-10ml` : `${slug}-50ml`;
}
