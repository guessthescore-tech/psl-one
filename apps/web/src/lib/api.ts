function resolveApiBase(): string {
  if (process.env['NEXT_PUBLIC_API_BASE_URL']) return process.env['NEXT_PUBLIC_API_BASE_URL'];
  if (typeof window === 'undefined') return 'http://localhost:4000';
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000'
    : 'https://api.beta.pslone.co.za';
}

const API_BASE =
  resolveApiBase();

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
