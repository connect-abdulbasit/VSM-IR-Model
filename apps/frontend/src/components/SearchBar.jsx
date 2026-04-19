import React, { useState } from 'react'
import { useSearch } from '../context/SearchContext'

export default function SearchBar() {
  const { state, dispatch, search } = useSearch()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [focused, setFocused] = useState(false)

  const handleKey = (e) => {
    if (e.key === 'Enter') search()
  }

  return (
    <div>
      {/* Main search row */}
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
            placeholder="e.g. immigration border wall, military defense…"
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
            >
              ×
            </button>
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
            fontSize: 14, fontWeight: 600, cursor: state.loading || !state.query.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
            whiteSpace: 'nowrap',
          }}
        >
          {state.loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {/* Advanced options toggle */}
      <div style={{ marginTop: 10 }}>
        <button
          onClick={() => setShowAdvanced(v => !v)}
          style={{
            border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 13, color: 'var(--gray-500)', padding: 0,
          }}
        >
          {showAdvanced ? '▾' : '▸'} Advanced options
        </button>

        {showAdvanced && (
          <div style={{
            marginTop: 10, padding: '14px 16px',
            background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius)',
            display: 'flex', gap: 24, flexWrap: 'wrap',
          }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)' }}>
                α threshold <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(min score)</span>
              </span>
              <input
                type="number" min="0" max="1" step="0.001"
                value={state.alpha}
                onChange={e => dispatch({ type: 'SET_ALPHA', payload: parseFloat(e.target.value) })}
                style={{
                  width: 90, padding: '6px 10px',
                  border: '1px solid var(--gray-200)', borderRadius: 6,
                  fontSize: 13, outline: 'none',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)' }}>
                Top K results
              </span>
              <input
                type="number" min="1" max="56"
                value={state.topK}
                onChange={e => dispatch({ type: 'SET_TOPK', payload: parseInt(e.target.value) })}
                style={{
                  width: 90, padding: '6px 10px',
                  border: '1px solid var(--gray-200)', borderRadius: 6,
                  fontSize: 13, outline: 'none',
                }}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
