import Link from 'next/link'

export interface Article {
  id: string
  title: string
  slug: string
  originalUrl: string
  publishedAt: string | Date
  summary?: string | null
  province?: string | null
  city?: string | null
  importanceScore: number
  status: string
  source: { name: string }
  category?: { name: string; slug: string } | null
}

const PROV: Record<string, string> = {
  NB: 'N.-Brunswick', CA: 'Canada', federal: 'Canada', QC: 'Québec', ON: 'Ontario', AB: 'Alberta', BC: 'C.-B.',
}

function ago(date: string | Date) {
  const d = new Date(date)
  const h = Math.floor((Date.now() - d.getTime()) / 3600000)
  if (h < 1) return 'À l\'instant'
  if (h < 24) return `Il y a ${h}h`
  const days = Math.floor(h / 24)
  if (days === 1) return 'Hier'
  if (days < 7) return `Il y a ${days}j`
  return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })
}

export default function ArticleCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  const isNB = article.province === 'NB'
  const isPinned = article.status === 'pinned'

  if (compact) return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          {article.category && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--red)', textTransform: 'uppercase' }}>{article.category.name}</span>}
          {isNB && <span style={{ fontSize: 10, background: 'var(--nb)', color: '#fff', padding: '1px 5px', borderRadius: 3 }}>NB</span>}
        </div>
        <Link href={`/article/${article.slug}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, color: 'var(--text)', marginBottom: 4 }}>{article.title}</h3>
        </Link>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{article.source.name} · {ago(article.publishedAt)}</div>
      </div>
    </div>
  )

  return (
    <article style={{
      background: 'var(--card)',
      border: `1px solid ${isPinned ? 'var(--red)' : 'var(--border)'}`,
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      {isPinned && <div style={{ height: 3, background: 'var(--red)' }} />}
      {!isPinned && article.importanceScore >= 80 && <div style={{ height: 3, background: '#F59E0B' }} />}
      <div style={{ padding: '16px' }}>
        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {isPinned && <span style={{ fontSize: 11, background: 'var(--red)', color: '#fff', padding: '2px 7px', borderRadius: 3, fontWeight: 600 }}>📌 Épinglé</span>}
          {article.category && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{article.category.name}</span>}
          {isNB && <span style={{ fontSize: 11, background: 'var(--nb)', color: '#fff', padding: '2px 6px', borderRadius: 3 }}>NB</span>}
          {article.city && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {article.city}</span>}
          {article.importanceScore >= 85 && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#B45309', fontWeight: 600 }}>● Important</span>}
        </div>

        {/* Titre */}
        <Link href={`/article/${article.slug}`} style={{ textDecoration: 'none' }}>
          <h2 style={{ fontFamily: 'Source Serif 4, serif', fontSize: 17, fontWeight: 700, lineHeight: 1.4, color: 'var(--text)', marginBottom: 8 }}>
            {article.title}
          </h2>
        </Link>

        {/* Résumé */}
        {article.summary && (
          <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.6, marginBottom: 12,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {article.summary}
          </p>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <strong style={{ color: '#374151' }}>{article.source.name}</strong> · {ago(article.publishedAt)}
            {article.province && ` · ${PROV[article.province] || article.province}`}
          </span>
          <a href={article.originalUrl} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Lire ↗
          </a>
        </div>
      </div>
    </article>
  )
}
