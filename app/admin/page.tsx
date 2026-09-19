'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Stats { today: { articles: number; nb: number; canada: number; immigration: number }; total: number; sources: { active: number; error: number }; lastSync: string | null }
interface Status { totalArticles: number; sourcesCount: number; lastSync: string | null; lastSyncStatus: string | null; lastSyncNew: number; lastArticleAt: string | null; recentLogs: Array<{ id: string; status: string; articlesFetched: number; articlesNew: number; startedAt: string; finishedAt: string | null; errorMessage: string | null; source: { name: string } | null }> }
interface Source { id: string; name: string; url: string; rssUrl?: string; type: string; province?: string; active: boolean; lastSyncAt?: string; articlesCount: number; errorCount: number; lastError?: string }

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [auth, setAuth] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [status, setStatus] = useState<Status | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [scraping, setScraping] = useState(false)
  const [scrapeMsg, setScrapeMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [tab, setTab] = useState<'dashboard' | 'sources'>('dashboard')
  const [addingSource, setAddingSource] = useState(false)
  const [newSrc, setNewSrc] = useState({ name: '', url: '', rssUrl: '', type: 'rss', province: 'NB', defaultCategory: '' })

  const headers = useCallback(() => ({ 'x-admin-secret': secret, 'Content-Type': 'application/json' }), [secret])

  const loadAll = useCallback(async () => {
    const [s, st, src] = await Promise.all([
      fetch('/api/admin/stats', { headers: { 'x-admin-secret': secret } }).then(r => r.ok ? r.json() : null),
      fetch('/api/admin/status', { headers: { 'x-admin-secret': secret } }).then(r => r.ok ? r.json() : null),
      fetch('/api/admin/sources', { headers: { 'x-admin-secret': secret } }).then(r => r.ok ? r.json() : null),
    ])
    if (s) setStats(s)
    if (st) setStatus(st)
    if (src) setSources(src.sources || [])
    return !!s
  }, [secret])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await loadAll()
    if (ok) setAuth(true)
    else alert('Clé incorrecte')
  }

  const handleScrape = async (sourceId?: string) => {
    setScraping(true); setScrapeMsg(null)
    try {
      const res = await fetch('/api/admin/scrape', { method: 'POST', headers: headers(), body: JSON.stringify(sourceId ? { sourceId } : {}) })
      const d = await res.json()
      setScrapeMsg({ ok: true, text: `✅ Collecte terminée — ${d.newArticles ?? 0} nouveaux articles (${d.total ?? 0} vérifiés, ${d.errors ?? 0} erreurs)` })
      await loadAll()
    } catch { setScrapeMsg({ ok: false, text: '❌ Erreur lors de la collecte' }) }
    setScraping(false)
  }

  useEffect(() => {
    if (auth) { const t = setInterval(loadAll, 60000); return () => clearInterval(t) }
  }, [auth, loadAll])

  if (!auth) return (
    <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#1E293B', borderRadius: 12, padding: 32, width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/favicon.svg" width={48} height={48} alt="" style={{ marginBottom: 8 }} />
          <h1 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 20, color: '#F8FAFC' }}>Infos Canada</h1>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Administration</div>
        </div>
        <form onSubmit={handleAuth}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Clé secrète</label>
          <input type="password" value={secret} onChange={e => setSecret(e.target.value)} placeholder="ADMIN_SECRET"
            style={{ width: '100%', padding: '10px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: 6, color: '#F8FAFC', fontSize: 14, marginBottom: 12, fontFamily: 'monospace' }} />
          <button type="submit" style={{ width: '100%', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 6, padding: 12, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
            Connexion
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 12, color: '#475569', textAlign: 'center' }}>Valeur : ADMIN_SECRET dans Vercel</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      {/* Header admin */}
      <div style={{ background: '#0F172A', color: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none', fontSize: 13 }}>← Site</Link>
            <span style={{ color: '#334155' }}>|</span>
            <img src="/favicon.svg" width={24} height={24} alt="" />
            <span style={{ fontFamily: 'Source Serif 4,serif', fontSize: 17, fontWeight: 700 }}>Infos Canada — Admin</span>
          </div>
          <button onClick={() => handleScrape()} disabled={scraping}
            style={{ background: scraping ? '#374151' : 'var(--red)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: scraping ? 'wait' : 'pointer', fontSize: 14, fontWeight: 600 }}>
            {scraping ? '⏳ Collecte en cours…' : '🔄 Lancer la collecte'}
          </button>
        </div>
        <div style={{ borderTop: '1px solid #1E293B', padding: '0 20px', maxWidth: 1200, margin: '0 auto', display: 'flex' }}>
          {[{ id: 'dashboard', label: '📊 Tableau de bord' }, { id: 'sources', label: '🔗 Sources' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as 'dashboard' | 'sources')}
              style={{ padding: '10px 18px', fontSize: 13, color: tab === t.id ? '#fff' : '#64748B', fontWeight: tab === t.id ? 600 : 400, background: 'none', border: 'none', borderBottom: tab === t.id ? '2px solid var(--red)' : '2px solid transparent', cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        {scrapeMsg && (
          <div style={{ background: scrapeMsg.ok ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${scrapeMsg.ok ? '#86EFAC' : '#FECACA'}`, borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: scrapeMsg.ok ? '#166534' : '#991B1B', fontWeight: 500 }}>
            {scrapeMsg.text}
          </div>
        )}

        {/* === DASHBOARD === */}
        {tab === 'dashboard' && (
          <div>
            {/* Statut collecte — LA section importante */}
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '20px', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📡 Statut de la collecte</h2>

              {status ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'Articles en base', value: status.totalArticles, color: '#D80621', icon: '📰' },
                    { label: 'Sources actives', value: status.sourcesCount, color: '#1E3A5F', icon: '🔗' },
                    { label: 'Nouveaux (dernier run)', value: status.lastSyncNew ?? '—', color: '#15803D', icon: '✨' },
                    { label: 'Statut dernier run', value: status.lastSyncStatus === 'success' ? '✅ OK' : status.lastSyncStatus === 'error' ? '❌ Erreur' : status.lastSyncStatus === 'running' ? '⏳ En cours' : '—', color: '#374151', icon: '🔄' },
                  ].map(c => (
                    <div key={c.label} style={{ background: '#F8FAFC', borderRadius: 8, padding: '16px' }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
                      <div style={{ fontSize: 26, fontWeight: 700, color: c.color, lineHeight: 1 }}>{c.value}</div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{c.label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 14, color: '#64748B', marginBottom: 16 }}>Chargement…</div>
              )}

              {status?.lastSync && (
                <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
                  Dernière collecte : <strong>{new Date(status.lastSync).toLocaleString('fr-CA', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</strong>
                  {status.lastArticleAt && <> · Dernier article : <strong>{new Date(status.lastArticleAt).toLocaleString('fr-CA', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</strong></>}
                </div>
              )}

              {/* Si aucun article */}
              {status?.totalArticles === 0 && (
                <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: '16px', marginBottom: 16 }}>
                  <strong style={{ color: '#92400E' }}>⚠️ Aucun article en base.</strong>
                  <p style={{ fontSize: 14, color: '#78350F', marginTop: 6 }}>
                    Cliquez sur <strong>"🔄 Lancer la collecte"</strong> en haut pour récupérer les premiers articles RSS. La collecte prend 1 à 3 minutes.
                  </p>
                </div>
              )}

              {/* Logs récents */}
              {status?.recentLogs && status.recentLogs.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Derniers runs :</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {status.recentLogs.map(log => (
                      <div key={log.id} style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13, padding: '6px 10px', background: '#F8FAFC', borderRadius: 6 }}>
                        <span>{log.status === 'success' ? '✅' : log.status === 'error' ? '❌' : '⏳'}</span>
                        <span style={{ color: '#374151', fontWeight: 500 }}>{log.source?.name || 'Toutes sources'}</span>
                        <span style={{ color: '#64748B' }}>{log.articlesNew} nouveaux / {log.articlesFetched} vérifiés</span>
                        <span style={{ color: '#94A3B8', marginLeft: 'auto' }}>{new Date(log.startedAt).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}</span>
                        {log.errorMessage && <span style={{ color: '#EF4444', fontSize: 12 }}>{log.errorMessage.substring(0, 40)}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats du jour */}
            {stats && (
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '20px' }}>
                <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📊 Aujourd&apos;hui</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 12 }}>
                  {[
                    { label: 'Articles collectés', value: stats.today.articles },
                    { label: 'Nouveau-Brunswick', value: stats.today.nb },
                    { label: 'Canada', value: stats.today.canada },
                    { label: 'Immigration', value: stats.today.immigration },
                    { label: 'Sources actives', value: stats.sources.active },
                    { label: 'Sources en erreur', value: stats.sources.error },
                  ].map(c => (
                    <div key={c.label} style={{ background: '#F8FAFC', borderRadius: 8, padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: '#1E3A5F' }}>{c.value}</div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{c.label}</div>
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
              <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 20, fontWeight: 700 }}>Sources ({sources.length})</h2>
              <button onClick={() => setAddingSource(true)}
                style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                + Ajouter
              </button>
            </div>

            {addingSource && (
              <div style={{ background: '#fff', border: '2px solid var(--red)', borderRadius: 10, padding: '20px', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 17, marginBottom: 16 }}>Nouvelle source</h3>
                <form onSubmit={async e => { e.preventDefault(); await fetch('/api/admin/sources', { method: 'POST', headers: headers(), body: JSON.stringify(newSrc) }); setAddingSource(false); loadAll() }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[['name','Nom','Ex: Radio-Canada NB'],['url','URL du site','https://…'],['rssUrl','URL RSS','https://…/feed.xml']].map(([k,l,p]) => (
                    <div key={k}>
                      <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>{l}</label>
                      <input type="text" placeholder={p} value={(newSrc as Record<string,string>)[k]} onChange={e => setNewSrc(s => ({...s,[k]:e.target.value}))}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Province</label>
                    <select value={newSrc.province} onChange={e => setNewSrc(s => ({...s,province:e.target.value}))}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }}>
                      <option value="NB">Nouveau-Brunswick</option>
                      <option value="federal">Canada fédéral</option>
                      <option value="QC">Québec</option>
                      <option value="all">Tout le Canada</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setAddingSource(false)} style={{ background: '#F1F5F9', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>Annuler</button>
                    <button type="submit" style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}>Enregistrer</button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sources.map(s => (
                <div key={s.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{s.name}</div>
                    {s.lastError && <div style={{ fontSize: 12, color: '#EF4444' }}>⚠ {s.lastError.substring(0,60)}</div>}
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      {s.province} · {s.articlesCount} articles
                      {s.lastSyncAt && ` · Sync: ${new Date(s.lastSyncAt).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}`}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 4, background: s.active ? '#DCFCE7' : '#FEF2F2', color: s.active ? '#166534' : '#991B1B', fontWeight: 600 }}>
                    {s.active ? 'Actif' : 'Inactif'}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleScrape(s.id)} style={{ background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: 5, padding: '5px 10px', cursor: 'pointer', fontSize: 12 }}>
                      🔄
                    </button>
                    <button onClick={async () => { await fetch('/api/admin/sources', { method: 'PATCH', headers: headers(), body: JSON.stringify({ id: s.id, active: !s.active }) }); loadAll() }}
                      style={{ background: s.active ? '#FEF2F2' : '#DCFCE7', color: s.active ? '#991B1B' : '#166534', border: 'none', borderRadius: 5, padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      {s.active ? 'Off' : 'On'}
                    </button>
                  </div>
                </div>
              ))}
              {sources.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: '#64748B', fontSize: 14 }}>
                  Aucune source. La base SQL doit être initialisée (voir README).
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
