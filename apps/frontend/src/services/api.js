const BASE = 'http://localhost:8080'

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  health:    ()              => request('/health'),
  stats:     ()              => request('/stats'),
  queries:   ()              => request('/queries'),
  document:  (id)            => request(`/document/${id}`),
  search:    (query) =>
    request('/search', {
      method: 'POST',
      body: JSON.stringify({ query, alpha: 0.005 }),
    }),
  rebuild: (min_df = 1, max_df_ratio = 0.95) =>
    request('/build', {
      method: 'POST',
      body: JSON.stringify({ min_df, max_df_ratio }),
    }),
}
