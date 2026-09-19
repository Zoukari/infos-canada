'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Log { id: string; status: string; articlesFetched: number; articlesNew: number; startedAt: string; finishedAt: string | null; errorMessage: string | null; source: { name: string } | null }
interface Status { totalArticles: number; sourcesCount: number; lastSync: string | null; lastSyncStatus: string | null; lastSyncNew: number; lastArticleAt: string | null; recentLogs: Log[] }
interface Source { id: string; name: string; rssUrl?: string; type: string; province?: string; active: boolean; lastSyncAt?: string; articlesCount: number; errorCount: number; lastError?: string }

function ago(s: string) {
  const m = Math.floor((Date.now() - new Date(s).getTime()) / 60000)
  if (m < 1) return 'À l\'instant'
  if (m < 60) return `Il y a ${m}min`
  const h = Math.floor(m / 60)
  return `Il y a ${h}h ${m % 60 > 0 ? `${m % 60}min` : ''}`
}

export default function Admin() {
  const [status, setStatus] = useState<Status | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [scraping, setScraping] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [tab, setTab] = useState<'dashboard' | 'sources' | 'logs'>('dashboard')

  const load = useCallback(async () => {
    const [st, src] = await Promise.all([
      fetch('/api/admin/status').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/admin/sources').then(r => r.ok ? r.json() : null).catch(() => null),
    ])
    if (st) setStatus(st)
    if (src) setSources(src.sources || [])
  }, [])

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t) }, [load])

  const scrape = async (sourceId?: string) => {
    setScraping(true); setMsg(null)
    try {
      const r = await fetch('/api/admin/scrape', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sourceId ? { sourceId } : {}) })
      const d = await r.json()
      setMsg({ ok: true, text: `✅ ${d.newArticles ?? 0} nouveaux articles sur ${d.total ?? 0} vérifiés` })
      load()
    } catch { setMsg({ ok: false, text: '❌ Erreur lors de la collecte' }) }
    setScraping(false)
  }

  const toggleSource = async (s: Source) => {
    await fetch('/api/admin/sources', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, active: !s.active }) })
    load()
  }

  const deleteSource = async (id: string) => {
    if (!confirm('Supprimer cette source ?')) return
    await fetch('/api/admin/sources', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    load()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      <div style={{ background: '#0F172A', color: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none', fontSize: 13 }}>← Site</Link>
            <span style={{ color: '#334155' }}>|</span>
            <img src="/maple-leaf.png" width={24} height={24} alt="" />
            <span style={{ fontFamily: 'Source Serif 4,serif', fontSize: 17, fontWeight: 700 }}>Infos Canada — Admin</span>
          </div>
          <button onClick={() => scrape()} disabled={scraping}
            style={{ background: scraping ? '#374151' : '#C8102E', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 20px', cursor: scraping ? 'wait' : 'pointer', fontSize: 14, fontWeight: 600 }}>
            {scraping ? '⏳ Collecte…' : '🔄 Lancer la collecte'}
          </button>
        </div>
        <div style={{ borderTop: '1px solid #1E293B', maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex' }}>
          {[['dashboard','📊 Dashboard'],['sources','🔗 Sources'],['logs','📋 Historique']].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id as 'dashboard' | 'sources' | 'logs')}
              style={{ padding: '10px 18px', fontSize: 13, color: tab === id ? '#fff' : '#64748B', fontWeight: tab === id ? 600 : 400, background: 'none', border: 'none', borderBottom: tab === id ? '2px solid #C8102E' : '2px solid transparent', cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        {msg && (
          <div style={{ background: msg.ok ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${msg.ok ? '#86EFAC' : '#FECACA'}`, borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: msg.ok ? '#166534' : '#991B1B', fontWeight: 500 }}>
            {msg.text}
          </div>
        )}

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '20px' }}>
              <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📡 Statut</h2>
              {status?.totalArticles === 0 && (
                <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: '14px', marginBottom: 16 }}>
                  <strong style={{ color: '#92400E' }}>⚠️ Base vide</strong>
                  <p style={{ fontSize: 14, color: '#78350F', marginTop: 4 }}>Cliquez sur <strong>🔄 Lancer la collecte</strong> en haut.</p>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 12, marginBottom: 16 }}>
                {[
                  { icon: '📰', label: 'Articles', value: status?.totalArticles ?? '—', color: '#C8102E' },
                  { icon: '🔗', label: 'Sources actives', value: status?.sourcesCount ?? '—', color: '#1E3A5F' },
                  { icon: '✨', label: 'Dernière collecte', value: status?.lastSyncNew != null ? `+${status.lastSyncNew}` : '—', color: '#15803D' },
                  { icon: status?.lastSyncStatus === 'success' ? '✅' : '⏳', label: 'Statut', value: status?.lastSyncStatus === 'success' ? 'OK' : 'En attente', color: '#374151' },
                ].map(c => (
                  <div key={c.label} style={{ background: '#F8FAFC', borderRadius: 8, padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: c.color, lineHeight: 1 }}>{c.value}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{c.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '12px 16px', fontSize: 14 }}>
                <strong>Dernière collecte :</strong> {status?.lastSync ? ago(status.lastSync) : 'Jamais lancée'}
                {status?.lastArticleAt && <> · <strong>Dernier article :</strong> {ago(status.lastArticleAt)}</>}
              </div>
            </div>
          </div>
        )}

        {/* LOGS — Tableau historique */}
        {tab === 'logs' && (
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
              <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 18, fontWeight: 700 }}>📋 Historique des collectes</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Statut','Source','Nouveaux','Vérifiés','Démarré','Durée','Erreur'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(status?.recentLogs || []).map(log => {
                    const dur = log.finishedAt ? Math.round((new Date(log.finishedAt).getTime() - new Date(log.startedAt).getTime()) / 1000) : null
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ fontSize: 16 }}>{log.status === 'success' ? '✅' : log.status === 'error' ? '❌' : '⏳'}</span>
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 500, color: '#1E293B' }}>{log.source?.name || 'Toutes sources'}</td>
                        <td style={{ padding: '10px 14px', color: '#15803D', fontWeight: 600 }}>+{log.articlesNew}</td>
                        <td style={{ padding: '10px 14px', color: '#64748B' }}>{log.articlesFetched}</td>
                        <td style={{ padding: '10px 14px', color: '#64748B', whiteSpace: 'nowrap' }}>{ago(log.startedAt)}</td>
                        <td style={{ padding: '10px 14px', color: '#64748B' }}>{dur != null ? `${dur}s` : '—'}</td>
                        <td style={{ padding: '10px 14px', color: '#EF4444', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.errorMessage || '—'}</td>
                      </tr>
                    )
                  })}
                  {(!status?.recentLogs || status.recentLogs.length === 0) && (
                    <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Aucun historique — lancez une collecte</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SOURCES */}
        {tab === 'sources' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Source Serif 4,serif', fontSize: 20, fontWeight: 700 }}>Sources ({sources.length})</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sources.map(s => (
                <div key={s.id} style={{ background: '#fff', border: `1px solid ${s.errorCount >= 3 ? '#FECACA' : '#E2E8F0'}`, borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>
                      {s.province || '—'} · {s.articlesCount} articles{s.lastSyncAt ? ` · ${ago(s.lastSyncAt)}` : ''}
                    </div>
                    {s.lastError && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 2 }}>⚠ {s.lastError.substring(0,70)}</div>}
                  </div>
                  <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 4, fontWeight: 600, background: s.active ? '#DCFCE7' : '#FEF2F2', color: s.active ? '#166534' : '#991B1B' }}>
                    {s.active ? 'Actif' : 'Inactif'}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => scrape(s.id)} style={{ background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: 5, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>🔄</button>
                    <button onClick={() => toggleSource(s)} style={{ background: s.active ? '#FEF2F2' : '#DCFCE7', color: s.active ? '#991B1B' : '#166534', border: 'none', borderRadius: 5, padding: '6px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      {s.active ? 'Off' : 'On'}
                    </button>
                    <button onClick={() => deleteSource(s.id)} style={{ background: '#FEF2F2', color: '#991B1B', border: 'none', borderRadius: 5, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
