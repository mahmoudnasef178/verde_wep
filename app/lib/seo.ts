// ─────────────────────────────────────────────
// Central SEO / site constants for VERDE
// Domain: verdepefumes.com (purchased domain)
// ─────────────────────────────────────────────

export const SITE_URL = 'https://www.verdepefumes.com';
export const SITE_NAME = 'Verde Perfumes';
export const SITE_NAME_AR = 'Verde Perfumes';
export const BRAND_NAME = 'VERDE';

// Used as the og:image for social sharing
export const DEFAULT_OG_IMAGE = `${SITE_URL}/products/Fortis%20Rex.webp`;
export const GOOGLE_VERIFICATION = 'JRweTA70ugg5goMiSM2Lof6dD6oitQkFTa3SRF8Wgvw';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://gradutionapi-production.up.railway.app';

// Social media links
export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/verde_perfumes/',
  facebook: 'https://www.facebook.com/profile.php?id=61591567621224',
  tiktok: 'https://www.tiktok.com/@verde5194',
  whatsapp: 'https://wa.me/201112333598',
};

// Canonical domain variations (old domain redirect target)
export const CANONICAL_BASE = SITE_URL;
