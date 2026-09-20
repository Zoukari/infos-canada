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

const PROV: Record<string, string> = { NB: 'N.-Brunswick', CA: 'Canada', federal: 'Canada', QC: 'Québec', ON: 'Ontario', AB: 'Alberta', BC: 'C.-B.' }

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
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-soft)' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center', flexWrap: 'wrap' }}>
        {article.category && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--red)', textTransform: 'uppercase' }}>{article.category.name}</span>}
      </div>
      <Link href={`/article/${article.slug}`} style={{ textDecoration: 'none' }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, color: 'var(--ink)', marginBottom: 4 }}>{article.title}</h3>
      </Link>
      <div style={{ fontSize: 12, color: '#9C9C9C' }}>{article.source.name} · {ago(article.publishedAt)}</div>
    </div>
  )

  return (
    <article style={{
      background: 'var(--card)',
      border: `1px solid ${isPinned ? 'var(--red)' : 'var(--border)'}`,
      borderRadius: 6,
      padding: '18px 20px',
      transition: 'border-color .15s',
    }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {isPinned && <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600 }}>★ Épinglé</span>}
        {article.category && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '.03em' }}>{article.category.name}</span>}
        {isNB && <span style={{ fontSize: 10, color: 'var(--nb)', fontWeight: 600, background: 'var(--nb-tint)', padding: '2px 7px', borderRadius: 3 }}>N.-B.</span>}
        {article.city && <span style={{ fontSize: 11, color: '#9C9C9C' }}>{article.city}</span>}
        {article.importanceScore >= 85 && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} title="Important" />}
      </div>

      <Link href={`/article/${article.slug}`} style={{ textDecoration: 'none' }}>
        <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 17, fontWeight: 600, lineHeight: 1.4, color: 'var(--ink)', marginBottom: 8 }}>
          {article.title}
        </h2>
      </Link>

      {article.summary && (
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 12,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {article.summary}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid var(--border-soft)' }}>
        <span style={{ fontSize: 12, color: '#9C9C9C' }}>
          <strong style={{ color: 'var(--ink-soft)', fontWeight: 500 }}>{article.source.name}</strong> · {ago(article.publishedAt)}
          {article.province && ` · ${PROV[article.province] || article.province}`}
        </span>
        <a href={article.originalUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--red)', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Lire l&apos;article ↗
        </a>
      </div>
    </article>
  )
}
