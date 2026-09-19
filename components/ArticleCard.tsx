import Link from 'next/link'

interface Article {
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
  source: { name: string; url?: string }
  category?: { name: string; slug: string; color?: string | null } | null
}

const PROVINCE_LABELS: Record<string, string> = {
  NB: 'Nouveau-Brunswick', CA: 'Canada', QC: 'Québec', ON: 'Ontario', AB: 'Alberta', BC: 'C.-B.', federal: 'Canada', NS: 'N.-É.', PE: 'Î.-P.-É.',
}

const IMPORTANCE_LABEL = (score: number) => {
  if (score >= 90) return { label: 'Majeur', color: '#D80621' }
  if (score >= 70) return { label: 'Important', color: '#B45309' }
  if (score >= 50) return { label: 'Utile', color: '#1E3A5F' }
  return null
}

function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffH / 24)
  if (diffH < 1) return 'il y a moins d\'1h'
  if (diffH < 24) return `il y a ${diffH}h`
  if (diffD === 1) return 'hier'
  if (diffD < 7) return `il y a ${diffD} jours`
  return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })
}

export default function ArticleCard({ article, size = 'normal' }: { article: Article; size?: 'large' | 'normal' | 'compact' }) {
  const imp = IMPORTANCE_LABEL(article.importanceScore)
  const isNB = article.province === 'NB'
  const isPinned = article.status === 'pinned'

  if (size === 'compact') {
    return (
      <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
            {article.category && (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {article.category.name}
              </span>
            )}
            {isNB && <span style={{ fontSize: 11, background: '#1E3A5F', color: '#fff', padding: '1px 6px', borderRadius: 3 }}>NB</span>}
          </div>
          <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: size === 'compact' ? 14 : 16, fontWeight: 600, lineHeight: 1.35, marginBottom: 4 }}>
            <Link href={`/article/${article.slug}`} style={{ textDecoration: 'none', color: 'var(--text)' }}>
              {article.title}
            </Link>
          </h3>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {article.source.name} · {timeAgo(article.publishedAt)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <article style={{
      background: 'var(--card-bg)',
      border: `1px solid ${isPinned ? 'var(--red)' : 'var(--border)'}`,
      borderRadius: 10,
      overflow: 'hidden',
      transition: 'box-shadow 0.2s, border-color 0.2s',
      position: 'relative',
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLElement
      el.style.boxShadow = '0 4px 20px rgba(0,0,0,.1)'
      el.style.borderColor = isPinned ? 'var(--red-dark)' : 'var(--border-hover)'
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLElement
      el.style.boxShadow = 'none'
      el.style.borderColor = isPinned ? 'var(--red)' : 'var(--border)'
    }}>
      {/* Barre de couleur selon importance */}
      {imp && <div style={{ height: 3, background: imp.color, position: 'absolute', top: 0, left: 0, right: 0 }} />}
      
      <div style={{ padding: size === 'large' ? '24px' : '18px' }}>
        {/* Meta ligne */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
          {isPinned && <span style={{ fontSize: 11, background: 'var(--red)', color: '#fff', padding: '2px 8px', borderRadius: 3, fontWeight: 600 }}>📌 Épinglé</span>}
          {article.category && (
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {article.category.name}
            </span>
          )}
          {isNB && <span style={{ fontSize: 11, background: '#1E3A5F', color: '#fff', padding: '2px 7px', borderRadius: 3, fontWeight: 500 }}>NB</span>}
          {article.city && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {article.city}</span>}
          {imp && (
            <span style={{ marginLeft: 'auto', fontSize: 11, color: imp.color, fontWeight: 600 }}>
              {imp.label}
            </span>
          )}
        </div>

        {/* Titre */}
        <h2 style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: size === 'large' ? 22 : 17,
          fontWeight: 700,
          lineHeight: 1.35,
          marginBottom: 10,
          color: 'var(--text)',
        }}>
          <Link href={`/article/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {article.title}
          </Link>
        </h2>

        {/* Résumé */}
        {article.summary && (
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {article.summary}
          </p>
        )}

        {/* Pied de carte */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 500, color: '#374151' }}>{article.source.name}</span>
            <span style={{ margin: '0 6px' }}>·</span>
            <span>{timeAgo(article.publishedAt)}</span>
            {article.province && (
              <>
                <span style={{ margin: '0 6px' }}>·</span>
                <span>{PROVINCE_LABELS[article.province] || article.province}</span>
              </>
            )}
          </div>
          <a
            href={article.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            Lire l&apos;original →
          </a>
        </div>
      </div>
    </article>
  )
}
