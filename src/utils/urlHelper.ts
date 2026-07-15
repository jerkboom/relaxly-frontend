/**
 * Centralized URL helper for Relaxly Frontend.
 * Ensures consistent base URL and referral link compiling across all components.
 */

export const getAppUrl = (): string => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://relaxlygh.com';
};

export const getReferralUrl = (
  referralCode: string,
  source: string = 'link',
  campaignId?: string,
  assetId?: string
): string => {
  if (!referralCode) return '';
  const baseUrl = getAppUrl();
  const url = new URL(`${baseUrl}/register`);
  url.searchParams.set('ref', referralCode);
  url.searchParams.set('source', source);
  if (campaignId) {
    url.searchParams.set('campaignId', campaignId);
  }
  if (assetId) {
    url.searchParams.set('assetId', assetId);
  }
  return url.toString();
};
