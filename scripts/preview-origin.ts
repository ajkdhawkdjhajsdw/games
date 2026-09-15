export function previewOrigin(origin: string | undefined, host: string | undefined, allowedHost: string | undefined): string | undefined {
  if (!origin || !host || !allowedHost || origin !== `https://${host}`) return origin;
  if (!/^[a-z0-9.-]+$/i.test(host)) return origin;
  const hostname = host.toLowerCase();
  const allowed = allowedHost.toLowerCase();
  const matches = allowed.startsWith('.') ? hostname.endsWith(allowed) && hostname.length > allowed.length : hostname === allowed;
  return matches ? 'http://127.0.0.1:3000' : origin;
}
