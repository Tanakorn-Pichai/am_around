export function getGoogleMapsApiKey(): string {
  const fromVite = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (fromVite && typeof fromVite === 'string') return fromVite;
  if (typeof __GOOGLE_MAPS_API_KEY__ !== 'undefined' && __GOOGLE_MAPS_API_KEY__) {
    return __GOOGLE_MAPS_API_KEY__;
  }
  return '';
}

/**
 * Tier 2 Google Maps Platform quota error detector.
 * Checks promise rejections / error payloads from Routes API and Places API (New).
 * Does NOT trigger on empty results or generic network errors.
 */
export function checkAndNotifyMapsQuotaError(error: unknown): boolean {
  if (!error) return false;
  const errObj = error as {
    status?: string | number;
    code?: string | number;
    message?: string;
    name?: string;
  };
  const combined = `${errObj.name ?? ''} ${errObj.status ?? ''} ${errObj.code ?? ''} ${errObj.message ?? ''} ${String(error)}`;
  const isQuotaError =
    errObj.status === 429 ||
    errObj.status === 'RESOURCE_EXHAUSTED' ||
    errObj.status === 'OVER_QUERY_LIMIT' ||
    /RESOURCE_EXHAUSTED|OVER_QUERY_LIMIT|OverQuotaMapError|QuotaExceededError|quota exceeded|429/i.test(
      combined
    );

  if (isQuotaError) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    return true;
  }
  return false;
}
