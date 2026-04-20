import React, { useState } from 'react'
import { useSearch } from '../context/SearchContext'

export default function SearchBar() {
  const { state, dispatch, search } = useSearch()
  const [focused, setFocused] = useState(false)

  const handleKey = (e) => {
    if (e.key === 'Enter') search()
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          background: 'var(--white)',
          border: `2px solid ${focused ? 'var(--blue-500)' : 'var(--gray-200)'}`,
          borderRadius: 'var(--radius)',
          padding: '0 14px',
          transition: 'border-color 0.15s',
          boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none',
        }}>
          <span style={{ color: 'var(--gray-400)', marginRight: 10, fontSize: 16 }}>🔍</span>
          <input
            type="text"
            placeholder="e.g. Hillary Clinton, peaceful change, muslims…"
            value={state.query}
            onChange={e => dispatch({ type: 'SET_QUERY', payload: e.target.value })}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: 15, padding: '12px 0',
              color: 'var(--gray-800)', background: 'transparent',
            }}
          />
          {state.query && (
            <button
              onClick={() => dispatch({ type: 'SET_QUERY', payload: '' })}
              style={{
                border: 'none', background: 'none', cursor: 'pointer',
                color: 'var(--gray-400)', fontSize: 18, lineHeight: 1, padding: 4,
              }}
              title="Clear"
            >×</button>
          )}
        </div>
        <button
          onClick={() => search()}
          disabled={state.loading || !state.query.trim()}
          style={{
            padding: '0 22px',
            background: state.loading || !state.query.trim() ? 'var(--gray-200)' : 'var(--blue-600)',
            color: state.loading || !state.query.trim() ? 'var(--gray-500)' : 'var(--white)',
            border: 'none', borderRadius: 'var(--radius)',
            fontSize: 14, fontWeight: 600,
            cursor: state.loading || !state.query.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s', whiteSpace: 'nowrap',
          }}
        >
          {state.loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      <p style={{ marginTop: 8, fontSize: 12, color: 'var(--gray-400)' }}>
        TF·IDF weighted · cosine similarity · α = 0.005 · all matching documents returned
      </p>
    </div>
  )
}
