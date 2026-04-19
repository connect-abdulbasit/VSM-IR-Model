import React from 'react'
import { useSearch } from '../context/SearchContext'

export default function QueryPresets() {
  const { state, dispatch, search } = useSearch()

  if (!state.presetQueries.length) return null

  const handleClick = (q) => {
    dispatch({ type: 'SET_QUERY', payload: q })
    search(q)
  }

  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>
        Try a sample query:
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {state.presetQueries.map((q, i) => {
          const active = state.query === q
          return (
            <button
              key={i}
              onClick={() => handleClick(q)}
              style={{
                padding: '4px 12px',
                fontSize: 13,
                borderRadius: 20,
                border: `1px solid ${active ? 'var(--blue-500)' : 'var(--gray-200)'}`,
                background: active ? 'var(--blue-50)' : 'var(--white)',
                color: active ? 'var(--blue-600)' : 'var(--gray-600)',
                cursor: 'pointer',
                transition: 'all 0.12s',
                fontWeight: active ? 500 : 400,
              }}
            >
              {q}
            </button>
          )
        })}
      </div>
    </div>
  )
}
