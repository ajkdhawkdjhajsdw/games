const clientId = sessionStorage.getItem('qh-client') || crypto.randomUUID();
sessionStorage.setItem('qh-client', clientId);

export class ApiError extends Error { constructor(public code: string) { super(code); } }
export async function api<T = Record<string, unknown>>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-Client-Id': clientId },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new ApiError(data.code || data.error?.code || data.error || 'SERVICE_RECOVERING');
  if ('devAuth' in data) data.devAuthEnabled = data.devAuth;
  if (data.room) {
    data.room.phase = data.room.phase.toUpperCase();
    data.room.mode = data.room.mode.toUpperCase().replaceAll('-', '_');
    if (data.room.result) data.room.result.outcome = data.room.result.outcome.toUpperCase();
    if (data.room.owner?.job?.cargo === 'fabric') data.room.owner.job.cargo = 'cloth';
  }
  return data as T;
}
