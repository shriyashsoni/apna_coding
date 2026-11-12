// Both review fields must agree before a product becomes public. Inconsistent
// legacy rows stay in admin review until a person explicitly approves them.
export function isPublicProduct(product: { status?: string; is_approved?: boolean }) {
  return product.status === 'approved' && product.is_approved === true;
}

export function isEthGlobalShowcase(url?: string | null) {
  try {
    const parsed = new URL(url || '');
    return parsed.protocol === 'https:' &&
      ['ethglobal.com', 'www.ethglobal.com'].includes(parsed.hostname) &&
      parsed.pathname.startsWith('/showcase/');
  } catch { return false; }
}
