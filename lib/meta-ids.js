/**
 * Single source of truth for Meta Catalog Feed <g:id> and Pixel/CAPI content_ids.
 * Must stay identical to Verde_Api/src/lib/meta-ids.js.
 *
 * - 50 ML (default) & Discover Boxes -> String(product.slug)
 * - 10 ML (non-discover perfumes)    -> `${String(product.slug)}-10ml`
 * - Missing slug                     -> ''
 */
export function toContentId(product, size) {
  if (!product) return '';
  const slug = String(product.slug || '').trim().toLowerCase();
  if (!slug) return '';

  const isDiscover =
    slug === 'discover-box' ||
    slug === 'winter-discover-box' ||
    slug.includes('discover');

  const normalizedSize =
    typeof size === 'string' ? size.toLowerCase().replace(/\s+/g, '') : '';
  const is10ml = !isDiscover && normalizedSize.includes('10ml');

  return is10ml ? `${slug}-10ml` : slug;
}
