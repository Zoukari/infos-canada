'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Status {
  totalArticles: number
  sourcesCount: number
  lastSync: string | null
  lastSyncStatus: string | null
  lastSyncNew: number
  lastArticleAt: string | null
  recentLogs: Array<{
    id: string; status: string; articlesFetched: number; articlesNew: number
    startedAt: string; finishedAt: string | null; errorMessage: string | null
    source: { name: string } | null
  }>
}
interface Source {
  id: string; name: string; url: string; rssUrl?: string; type: string
  province?: string; active: boolean; lastSyncAt?: string
  articlesCount: number; errorCount: number; lastError?: string
}

function timeAgo(dateStr: string) {
  const d = new Date(dateStr)
  const diff = Math.floor((Date.now() - d.getTime()) / 60000)
  if (diff < 1) return 'À l\'instant'
  if (diff < 60) return `Il y a ${diff} minute${diff > 1 ? 's' : ''}`
  const h = Math.floor(diff / 60)
  const m = diff % 60
  if (h < 24) return `Il y a ${h}h${m > 0 ? ` ${m}min` : ''}`
  return `Il y a ${Math.floor(h / 24)} jour${Math.floor(h / 24) > 1 ? 's' : ''}`
}

export default function AdminPage() {
  const [status, setStatus] = useState<Status | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [scraping, setScraping] = useState(false)
  const [scrapeMsg, setScrapeMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [tab, setTab] = useState<'dashboard' | 'sources'>('dashboard')
  const [addingSource, setAddingSource] = useState(false)
  const [newSrc, setNewSrc] = useState({ name: '', url: '', rssUrl: '', type: 'rss', province: 'NB', defaultCategory: '' })
  const [now, setNow] = useState(new Date())

  // Mettre à jour l'heure toutes les minutes pour le "il y a X"
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])
  void now // used to trigger re-render

  const loadAll = useCallback(async () => {
    const [st, src] = await Promise.all([
      fetch('/api/admin/status').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/admin/sources').then(r => r.ok ? r.json() : null).catch(() => null),
    ])
    if (st) setStatus(st)
    if (src) setSources(src.sources || [])
  }, [])

  useEffect(() => {
    loadAll()
    const t = setInterval(loadAll, 30000)
    return () => clearInterval(t)
  }, [loadAll])

  const handleScrape = async (sourceId?: string) => {
    setScraping(true); setScrapeMsg(null)
    try {
      const res = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sourceId ? { sourceId } : {})
      })
      const d = await res.json()
      setScrapeMsg({ ok: true, text: `✅ Terminé — ${d.newArticles ?? 0} nouveaux articles récupérés sur ${d.total ?? 0} vérifiés` })
      await loadAll()
    } catch {
      setScrapeMsg({ ok: false, text: '❌ Erreur lors de la collecte' })
    }
    setScraping(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      {/* Header */}
      <div style={{ background: '#0F172A', color: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none', fontSize: 13 }}>← Site public</Link>
            <span style={{ color: '#334155' }}>|</span>
            <img src="/favicon.svg" width={24} height={24} alt="" />
            <span style={{ fontFamily: 'Source Serif 4,serif', fontSize: 17, fontWeight: 700 }}>Infos Canada — Admin</span>
          </div>
          <button onClick={() => handleScrape()} disabled={scraping}
            style={{ background: scraping ? '#374151' : '#D80621', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 20px', cursor: scraping ? 'wait' : 'pointer', fontSize: 14, fontWeight: 600 }}>
            {scraping ? '⏳ Collecte en cours…' : '🔄 Lancer la collecte'}
          </button>
        </div>
        <div style={{ borderTop: '1px solid #1E293B', padding: '0 20px', maxWidth: 1100, margin: '0 auto', display: 'flex' }}>
          {[{ id: 'dashboard', label: '📊 Tableau de bord' }, { id: 'sources', label: '🔗 Sources' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as 'dashboard' | 'sources')}
              style={{ padding: '10px 18px', fontSize: 13, color: tab === t.id ? '#fff' : '#64748B', fontWeight: tab === t.id ? 600 : 400, background: 'none', border: 'none', borderBottom: tab === t.id ? '2px solid #D80621' : '2px solid transparent', cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>

        {/* Message collecte */}
        {scrapeMsg && (
          <div style={{ background: scrapeMsg.ok ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${scrapeMsg.ok ? '#86EFAC' : '#FECACA'}`, borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: scrapeMsg.ok ? '#166534' : '#991B1B', fontWeight: 500 }}>
            {scrapeMsg.text}
          </div>
        )}

        {/* === DASHBOARD === */}
        {tab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Statut collecte */}
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '20px' }}>
              <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📡 Statut de la collecte</h2>

              {/* Alerte si base vide */}
              {status?.totalArticles === 0 && (
                <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: '16px', marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, color: '#92400E', marginBottom: 6 }}>⚠️ Aucun article en base</div>
                  <div style={{ fontSize: 14, color: '#78350F' }}>
                    Cliquez sur <strong>🔄 Lancer la collecte</strong> en haut pour récupérer les premiers articles. La collecte prend 1 à 3 minutes.
                  </div>
                </div>
              )}

              {/* Grille de stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12, marginBottom: 20 }}>
                {[
                  { icon: '📰', label: 'Articles en base', value: status?.totalArticles ?? '—', color: '#D80621' },
                  { icon: '🔗', label: 'Sources actives', value: status?.sourcesCount ?? '—', color: '#1E3A5F' },
                  { icon: '✨', label: 'Dernière collecte', value: status?.lastSyncNew != null ? `+${status.lastSyncNew}` : '—', color: '#15803D' },
                  { icon: status?.lastSyncStatus === 'success' ? '✅' : status?.lastSyncStatus === 'error' ? '❌' : '⏳', label: 'Statut', value: status?.lastSyncStatus === 'success' ? 'OK' : status?.lastSyncStatus === 'error' ? 'Erreur' : 'En attente', color: '#374151' },
                ].map(c => (
                  <div key={c.label} style={{ background: '#F8FAFC', borderRadius: 8, padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: c.color, lineHeight: 1 }}>{c.value}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{c.label}</div>
                  </div>
                ))}
              </div>

              {/* Dernière actualisation */}
              <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '14px 16px', fontSize: 14, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <span style={{ color: '#64748B' }}>Dernière collecte : </span>
                  <strong style={{ color: '#1E293B' }}>
                    {status?.lastSync
                      ? `${timeAgo(status.lastSync)} (${new Date(status.lastSync).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })})`
                      : 'Jamais — lancez la première collecte'}
                  </strong>
                </div>
                {status?.lastArticleAt && (
                  <div>
                    <span style={{ color: '#64748B' }}>Dernier article : </span>
                    <strong style={{ color: '#1E293B' }}>{timeAgo(status.lastArticleAt)}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Logs récents */}
            {status?.recentLogs && status.recentLogs.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '20px' }}>
                <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>📋 Derniers runs</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {status.recentLogs.map(log => (
                    <div key={log.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '9px 12px', background: '#F8FAFC', borderRadius: 6, flexWrap: 'wrap', fontSize: 13 }}>
                      <span style={{ fontSize: 16 }}>{log.status === 'success' ? '✅' : log.status === 'error' ? '❌' : '⏳'}</span>
                      <span style={{ fontWeight: 600, color: '#1E293B' }}>{log.source?.name || 'Toutes les sources'}</span>
                      <span style={{ color: '#15803D', fontWeight: 600 }}>+{log.articlesNew} nouveaux</span>
                      <span style={{ color: '#64748B' }}>{log.articlesFetched} vérifiés</span>
                      <span style={{ color: '#94A3B8', marginLeft: 'auto' }}>{timeAgo(log.startedAt)}</span>
                      {log.errorMessage && <span style={{ color: '#EF4444', fontSize: 12, width: '100%' }}>↳ {log.errorMessage.substring(0, 80)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* === SOURCES === */}
        {tab === 'sources' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 20, fontWeight: 700 }}>Sources RSS ({sources.length})</h2>
              <button onClick={() => setAddingSource(v => !v)}
                style={{ background: '#D80621', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                + Ajouter
              </button>
            </div>

            {addingSource && (
              <div style={{ background: '#fff', border: '2px solid #D80621', borderRadius: 10, padding: '20px', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 17, marginBottom: 14 }}>Nouvelle source</h3>
                <form onSubmit={async e => {
                  e.preventDefault()
                  await fetch('/api/admin/sources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSrc) })
                  setAddingSource(false)
                  setNewSrc({ name: '', url: '', rssUrl: '', type: 'rss', province: 'NB', defaultCategory: '' })
                  loadAll()
                }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[['name','Nom','Ex: Radio-Canada NB'],['url','URL du site','https://…'],['rssUrl','URL RSS (obligatoire)','https://…/feed.xml']].map(([k,l,p]) => (
                    <div key={k}>
                      <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>{l}</label>
                      <input type="text" placeholder={p} value={(newSrc as Record<string,string>)[k]}
                        onChange={e => setNewSrc(s => ({...s,[k]:e.target.value}))}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 14 }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Province</label>
                    <select value={newSrc.province} onChange={e => setNewSrc(s => ({...s,province:e.target.value}))}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 14 }}>
                      <option value="NB">Nouveau-Brunswick</option>
                      <option value="federal">Canada fédéral</option>
                      <option value="QC">Québec</option>
                      <option value="all">Tout le Canada</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setAddingSource(false)} style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>Annuler</button>
                    <button type="submit" style={{ background: '#D80621', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}>Enregistrer</button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sources.map(s => (
                <div key={s.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      {s.province || '—'} · {s.articlesCount} articles
                      {s.lastSyncAt && ` · ${timeAgo(s.lastSyncAt)}`}
                    </div>
                    {s.lastError && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 2 }}>⚠ {s.lastError.substring(0,70)}</div>}
                  </div>
                  <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 4, fontWeight: 600, background: s.active ? '#DCFCE7' : '#FEF2F2', color: s.active ? '#166534' : '#991B1B' }}>
                    {s.active ? 'Actif' : 'Inactif'}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleScrape(s.id)} title="Collecter cette source"
                      style={{ background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: 5, padding: '6px 10px', cursor: 'pointer', fontSize: 13 }}>
                      🔄
                    </button>
                    <button onClick={async () => {
                      await fetch('/api/admin/sources', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, active: !s.active }) })
                      loadAll()
                    }} style={{ background: s.active ? '#FEF2F2' : '#DCFCE7', color: s.active ? '#991B1B' : '#166534', border: 'none', borderRadius: 5, padding: '6px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      {s.active ? 'Désactiver' : 'Activer'}
                    </button>
                  </div>
                </div>
              ))}
              {sources.length === 0 && (
                <div style={{ padding: 28, textAlign: 'center', color: '#64748B', fontSize: 14, background: '#fff', borderRadius: 10, border: '1px dashed #E2E8F0' }}>
                  Aucune source. La base SQL doit être initialisée — voir README.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
