const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export async function apiRequest(path, { method = 'GET', token, body } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error('Could not reach the server. Make sure the backend is running.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'The request could not be completed.');
    error.status = response.status;
    throw error;
  }
  return data;
}

export function normalizeSangat(listing) {
  return { ...listing, id: listing.id || listing._id };
}

export function normalizeNote(note) {
  return { ...note, id: note.id || note._id };
}
