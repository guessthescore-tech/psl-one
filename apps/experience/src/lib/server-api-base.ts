/**
 * Server-side API base resolver for deployed experience pages.
 *
 * INTERNAL_API_URL is preferred for EC2/container networking. Vercel does not
 * have that private network, so it can use the public API base instead.
 */
export function getServerApiBase(): string {
  return (
    process.env['INTERNAL_API_URL'] ??
    process.env['API_BASE_URL'] ??
    process.env['NEXT_PUBLIC_API_BASE_URL'] ??
    'https://api.beta.pslone.co.za'
  );
}
