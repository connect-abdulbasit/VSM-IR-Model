import React from 'react'
import { useSearch } from '../context/SearchContext'

const styles = {
  panel: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  title: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  stat: {
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statVal: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    fontFamily: 'JetBrains Mono, monospace',
    lineHeight: 1,
  },
  statLbl: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500',
  },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    borderTop: '1px solid var(--border)',
    paddingTop: '14px',
  },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  dot: (color) => ({
    width: '10px', height: '10px',
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  }),
}

function Stat({ value, label, color = 'var(--blue)' }) {
  return (
    <div style={styles.stat}>
      <span style={{ ...styles.statVal, color }}>{value ?? '—'}</span>
      <span style={styles.statLbl}>{label}</span>
    </div>
  )
}

export default function StatsPanel() {
  const { state } = useSearch()
  const s = state.stats

  return (
    <div style={styles.panel}>
      <span style={styles.title}>Index Statistics</span>

      <div style={styles.grid}>
        <Stat value={s?.num_documents}   label="Documents"   color="var(--blue)" />
        <Stat value={s?.vocabulary_size?.toLocaleString()} label="Vocabulary"  color="var(--purple)" />
        <Stat value={s?.total_postings?.toLocaleString()}  label="Postings"    color="var(--green)" />
        <Stat value={s?.avg_terms_per_doc} label="Avg/Doc"   color="var(--yellow)" />
      </div>

      <div style={styles.legend}>
        <span style={{ ...styles.statLbl, marginBottom: '4px' }}>Score Legend</span>
        <div style={styles.legendRow}>
          <div style={styles.dot('var(--green)')} />
          High similarity ≥ 0.30
        </div>
        <div style={styles.legendRow}>
          <div style={styles.dot('var(--yellow)')} />
          Medium similarity 0.10 – 0.30
        </div>
        <div style={styles.legendRow}>
          <div style={styles.dot('var(--red)')} />
          Low similarity &lt; 0.10
        </div>
      </div>

      <div style={styles.legend}>
        <span style={{ ...styles.statLbl, marginBottom: '4px' }}>Weighting Scheme</span>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
          w(t,d) = tf(t,d) × log(N/df(t))
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
          sim(q,d) = cos(q⃗, d⃗)
        </span>
      </div>
    </div>
  )
}
