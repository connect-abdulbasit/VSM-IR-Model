import React, { useEffect } from 'react'
import { useSearch } from '../context/SearchContext'

function highlight(text, query) {
  if (!query) return text
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2)
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  if (!terms.length) return text
  const regex = new RegExp(`(${terms.join('|')})`, 'gi')
  return text.split(regex).map((part, i) =>
    regex.test(part)
      ? <mark key={i} style={{ background: '#fef08a', borderRadius: 2, padding: '0 1px' }}>{part}</mark>
      : part
  )
}

export default function DocumentModal() {
  const { state, closeDoc } = useSearch()
  const { selectedDoc, docLoading, selectedDocId, query } = state

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeDoc() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeDoc])

  if (selectedDocId === null) return null

  return (
    <div
      onClick={closeDoc}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--white)',
          borderRadius: 12,
          width: '100%', maxWidth: 700,
          maxHeight: '85vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeUp 0.2s ease',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--gray-200)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 12, flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>
              {docLoading ? 'Loading…' : selectedDoc?.title || `speech_${selectedDocId}.txt`}
            </div>
            {selectedDoc && !docLoading && (
              <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', gap: 14 }}>
                <span>📄 {selectedDoc.filename}</span>
                <span>📝 {selectedDoc.word_count?.toLocaleString()} words</span>
              </div>
            )}
          </div>
          <button
            onClick={closeDoc}
            style={{
              border: '1px solid var(--gray-200)', borderRadius: 6,
              background: 'var(--gray-50)', color: 'var(--gray-600)',
              width: 30, height: 30, cursor: 'pointer',
              fontSize: 16, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Close (Esc)"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{
          overflowY: 'auto', padding: '20px',
          fontSize: 14, lineHeight: 1.8,
          color: 'var(--gray-700)', flexGrow: 1,
        }}>
          {docLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
              <div style={{ animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: 24 }}>⟳</div>
              <div style={{ marginTop: 10 }}>Loading document…</div>
            </div>
          ) : (
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {highlight(selectedDoc?.content || '', query)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid var(--gray-200)',
          fontSize: 12, color: 'var(--gray-400)',
          display: 'flex', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span>Query terms highlighted in yellow</span>
          <span>Press Esc to close</span>
        </div>
      </div>
    </div>
  )
}
