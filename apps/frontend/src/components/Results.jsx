import React from 'react'
import { useSearch } from '../context/SearchContext'

function scoreLabel(score) {
  if (score >= 0.3) return { text: 'High',   bg: 'var(--green-100)',  color: 'var(--green-700)' }
  if (score >= 0.1) return { text: 'Medium', bg: 'var(--yellow-100)', color: 'var(--yellow-700)' }
  return               { text: 'Low',    bg: 'var(--red-100)',    color: 'var(--red-700)' }
}

function ResultCard({ result, rank }) {
  const { openDoc } = useSearch()
  const { doc_id, score } = result
  const { text, bg, color } = scoreLabel(score)
  const barWidth = Math.min((score / 0.4) * 100, 100)

  return (
    <div
      onClick={() => openDoc(doc_id)}
      style={{
        background: 'var(--white)',
        border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius)',
        padding: '16px 18px',
        cursor: 'pointer',
        animation: `fadeUp 0.2s ease ${rank * 25}ms both`,
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
        e.currentTarget.style.borderColor = 'var(--gray-300)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = 'var(--gray-200)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'var(--gray-100)', color: 'var(--gray-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>
            {rank}
          </span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>speech_{doc_id}.txt</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Document ID: {doc_id}</div>
          </div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '2px 8px',
          borderRadius: 4, background: bg, color,
        }}>
          {text}
        </span>
      </div>

      {/* Score bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          flex: 1, height: 6, background: 'var(--gray-100)',
          borderRadius: 3, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${barWidth}%`,
            background: color, borderRadius: 3,
            transition: 'width 0.4s ease',
          }} />
        </div>
        <span style={{
          fontSize: 12, fontWeight: 600, color,
          minWidth: 48, textAlign: 'right',
          fontFamily: 'monospace',
        }}>
          {score.toFixed(4)}
        </span>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: 'var(--gray-400)' }}>
        Click to read full speech →
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          background: 'var(--white)', border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius)', height: 88,
          opacity: 1 - i * 0.2,
          animation: 'pulse 1.2s ease-in-out infinite',
        }} />
      ))}
    </div>
  )
}

export default function Results() {
  const { state } = useSearch()
  const { loading, results, error, hasSearched, total, query } = state

  if (loading) return <Skeleton />

  if (error) return (
    <div style={{
      background: 'var(--red-100)', border: '1px solid #fca5a5',
      borderRadius: 'var(--radius)', padding: '14px 18px',
      color: 'var(--red-700)', fontSize: 14,
    }}>
      ⚠ {error}
    </div>
  )

  if (!hasSearched) return (
    <div style={{
      textAlign: 'center', padding: '60px 0',
      color: 'var(--gray-400)',
    }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>📄</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 6 }}>
        Enter a query to get started
      </div>
      <div style={{ fontSize: 13 }}>
        Type in the search box above or pick a sample query
      </div>
    </div>
  )

  if (results.length === 0) return (
    <div style={{
      textAlign: 'center', padding: '60px 0',
      color: 'var(--gray-400)',
    }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>🔎</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 6 }}>
        No results found
      </div>
      <div style={{ fontSize: 13 }}>
        Try lowering the α threshold or different keywords
      </div>
    </div>
  )

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 14 }}>
        <strong style={{ color: 'var(--gray-800)' }}>{total} result{total !== 1 ? 's' : ''}</strong>{' '}
        for <em>"{query}"</em>
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {results.map((r, i) => (
          <ResultCard key={r.doc_id} result={r} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}
