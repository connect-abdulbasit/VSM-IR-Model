import React from 'react'
import { SearchProvider } from './context/SearchContext'
import SearchBar from './components/SearchBar'
import QueryPresets from './components/QueryPresets'
import Results from './components/Results'
import DocumentModal from './components/DocumentModal'

export default function App() {
  return (
    <SearchProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--gray-50)' }}>

        <header style={{
          background: 'var(--white)',
          borderBottom: '1px solid var(--gray-200)',
          padding: '0 24px',
        }}>
          <div style={{
            maxWidth: 720, margin: '0 auto', height: 56,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>🔍</span>
              <span style={{ fontWeight: 700, fontSize: 16 }}>VSM Search</span>
              <span style={{ color: 'var(--gray-300)', margin: '0 2px' }}>|</span>
              <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>CS4051 · Assignment 2</span>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 500,
              background: 'var(--blue-50)', color: 'var(--blue-600)',
              padding: '3px 10px', borderRadius: 20,
            }}>56 documents</span>
          </div>
        </header>

        <div style={{
          background: 'var(--white)',
          borderBottom: '1px solid var(--gray-200)',
          padding: '28px 24px 22px',
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
              Search Trump Speeches
            </h1>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 20 }}>
              Ranked by cosine similarity · TF·IDF weighting
            </p>
            <SearchBar />
            <div style={{ marginTop: 14 }}>
              <QueryPresets />
            </div>
          </div>
        </div>

        <main style={{ flex: 1, padding: '24px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
          <Results />
        </main>

        <footer style={{
          borderTop: '1px solid var(--gray-200)',
          background: 'var(--white)',
          padding: '12px 24px',
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--gray-500)',
        }}>
          Vector Space Model · Cosine Similarity · Spring 2026
        </footer>
      </div>
      <DocumentModal />
    </SearchProvider>
  )
}
