'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Stats {
  today: { articles: number; nb: number; canada: number; immigration: number }
  total: number
  sources: { active: number; error: number }
  lastSync: string | null
}

interface Source {
  id: string
  name: string
  url: string
  rssUrl?: string
  type: string
  province?: string
  active: boolean
  lastSyncAt?: string
  articlesCount: number
  errorCount: number
  lastError?: string
}

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [scraping, setScraping] = useState(false)
  const [scrapeResult, setScrapeResult] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sources' | 'logs'>('dashboard')
  const [addingSource, setAddingSource] = useState(false)
  const [newSource, setNewSource] = useState({ name: '', url: '', rssUrl: '', type: 'rss', province: 'NB', defaultCategory: '' })

  const fetchStats = async (s: string) => {
    const res = await fetch('/api/admin/stats', { headers: { 'x-admin-secret': s } })
    if (res.ok) { setStats(await res.json()); return true }
    return false
  }

  const fetchSources = async (s: string) => {
    const res = await fetch('/api/admin/sources', { headers: { 'x-admin-secret': s } })
    if (res.ok) { const d = await res.json(); setSources(d.sources || []) }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await fetchStats(secret)
    if (ok) { setAuthenticated(true); fetchSources(secret) }
    else alert('Clé incorrecte')
  }

  const handleScrapeAll = async () => {
    setScraping(true); setScrapeResult(null)
    const res = await fetch('/api/admin/scrape', { method: 'POST', headers: { 'x-admin-secret': secret, 'Content-Type': 'application/json' }, body: '{}' })
    const data = await res.json()
    setScrapeResult(`✅ Collecte terminée : ${data.newArticles || 0} nouveaux articles récupérés (${data.total || 0} vérifiés, ${data.errors || 0} erreurs)`)
    setScraping(false)
    fetchStats(secret); fetchSources(secret)
  }

  const handleScrapeOne = async (sourceId: string) => {
    const res = await fetch('/api/admin/scrape', { method: 'POST', headers: { 'x-admin-secret': secret, 'Content-Type': 'application/json' }, body: JSON.stringify({ sourceId }) })
    const data = await res.json()
    alert(`✅ ${data.newArticles || 0} nouveaux articles`)
    fetchSources(secret)
  }

  const handleToggleSource = async (source: Source) => {
    await fetch('/api/admin/sources', { method: 'PATCH', headers: { 'x-admin-secret': secret, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: source.id, active: !source.active }) })
    fetchSources(secret)
  }

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/admin/sources', { method: 'POST', headers: { 'x-admin-secret': secret, 'Content-Type': 'application/json' }, body: JSON.stringify(newSource) })
    setAddingSource(false); setNewSource({ name: '', url: '', rssUrl: '', type: 'rss', province: 'NB', defaultCategory: '' })
    fetchSources(secret)
  }

  useEffect(() => {
    if (authenticated) { const t = setInterval(() => fetchStats(secret), 60000); return () => clearInterval(t) }
  }, [authenticated, secret])

  if (!authenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#1E293B', borderRadius: 12, padding: '40px', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,.4)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🇨🇦</div>
            <h1 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 22, color: '#F8FAFC', marginBottom: 4 }}>Infos Canada</h1>
            <div style={{ fontSize: 14, color: '#94A3B8' }}>Administration</div>
          </div>
          <form onSubmit={handleAuth}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Clé secrète</label>
              <input type="password" value={secret} onChange={e => setSecret(e.target.value)} placeholder="Entrez votre clé admin"
                style={{ width: '100%', padding: '11px 14px', background: '#0F172A', border: '1px solid #334155', borderRadius: 6, color: '#F8FAFC', fontSize: 14, fontFamily: 'monospace' }} />
            </div>
            <button type="submit" style={{ width: '100%', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 6, padding: '12px', cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
              Connexion
            </button>
          </form>
          <div style={{ marginTop: 20, fontSize: 12, color: '#475569', textAlign: 'center' }}>
            Configurez ADMIN_SECRET dans votre .env.local
          </div>
        </div>
      </div>
    )
  }

  const STAT_CARDS = stats ? [
    { label: 'Articles aujourd\'hui', value: stats.today.articles, sub: 'collectés ce jour', color: 'var(--red)' },
    { label: 'Nouveau-Brunswick', value: stats.today.nb, sub: 'articles NB', color: '#1E3A5F' },
    { label: 'Canada', value: stats.today.canada, sub: 'articles nationaux', color: '#374151' },
    { label: 'Immigration', value: stats.today.immigration, sub: 'articles immigration', color: '#7C3AED' },
    { label: 'Sources actives', value: stats.sources.active, sub: `${stats.sources.error} en erreur`, color: '#15803D' },
    { label: 'Total articles', value: stats.total, sub: 'dans la base', color: '#B45309' },
  ] : []

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      {/* Admin header */}
      <div style={{ background: '#0F172A', color: '#fff', padding: '0' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontSize: 13 }}>← Site public</Link>
            <span style={{ color: 'rgba(255,255,255,.3)' }}>|</span>
            <span style={{ fontFamily: "'Source Serif 4', serif", fontSize: 18, fontWeight: 700 }}>🇨🇦 Admin — Infos Canada</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {stats?.lastSync && (
              <span style={{ fontSize: 12, color: '#64748B' }}>
                Dernière sync: {new Date(stats.lastSync).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button onClick={handleScrapeAll} disabled={scraping}
              style={{ background: scraping ? '#374151' : 'var(--red)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: scraping ? 'wait' : 'pointer', fontSize: 13, fontWeight: 600 }}>
              {scraping ? '⏳ Collecte…' : '🔄 Lancer la collecte'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderTop: '1px solid #1E293B', padding: '0 24px' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 0 }}>
            {[{ id: 'dashboard', label: '📊 Tableau de bord' }, { id: 'sources', label: '🔗 Sources' }, { id: 'logs', label: '📋 Logs' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as 'dashboard' | 'sources' | 'logs')}
                style={{ padding: '12px 20px', fontSize: 13, color: activeTab === tab.id ? '#fff' : '#64748B', fontWeight: activeTab === tab.id ? 600 : 400, background: 'none', border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--red)' : '2px solid transparent', cursor: 'pointer' }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px' }}>
        {scrapeResult && (
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 8, padding: '14px 18px', marginBottom: 24, fontSize: 14, color: '#166534', fontWeight: 500 }}>
            {scrapeResult}
          </div>
        )}

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              {STAT_CARDS.map(card => (
                <div key={card.label} style={{ background: '#fff', borderRadius: 10, padding: '20px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{card.label}</div>
                  <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: 32, fontWeight: 700, color: card.color, lineHeight: 1 }}>{card.value}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{card.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 10, padding: '24px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Actions rapides</h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={handleScrapeAll} disabled={scraping}
                  style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  🔄 Collecter toutes les sources
                </button>
                <button onClick={() => setActiveTab('sources')}
                  style={{ background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  🔗 Gérer les sources
                </button>
                <Link href="/" style={{ display: 'inline-block', background: '#F1F5F9', color: 'var(--text)', borderRadius: 6, padding: '10px 20px', textDecoration: 'none', fontSize: 14, border: '1px solid var(--border)' }}>
                  👁 Voir le site
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Sources */}
        {activeTab === 'sources' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 22, fontWeight: 700 }}>Sources ({sources.length})</h2>
              <button onClick={() => setAddingSource(true)}
                style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                + Ajouter une source
              </button>
            </div>

            {addingSource && (
              <div style={{ background: '#fff', border: '2px solid var(--red)', borderRadius: 10, padding: '24px', marginBottom: 24 }}>
                <h3 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 18, marginBottom: 20 }}>Nouvelle source</h3>
                <form onSubmit={handleAddSource} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { name: 'name', label: 'Nom', placeholder: 'Ex: Radio-Canada NB' },
                    { name: 'url', label: 'URL site', placeholder: 'https://…' },
                    { name: 'rssUrl', label: 'URL RSS', placeholder: 'https://…/feed.xml' },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{f.label}</label>
                      <input type="text" placeholder={f.placeholder} value={(newSource as Record<string, string>)[f.name]} onChange={e => setNewSource(p => ({ ...p, [f.name]: e.target.value }))}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Province</label>
                    <select value={newSource.province} onChange={e => setNewSource(p => ({ ...p, province: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }}>
                      <option value="NB">Nouveau-Brunswick</option>
                      <option value="federal">Canada fédéral</option>
                      <option value="QC">Québec</option>
                      <option value="all">Tout le Canada</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1/-1', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setAddingSource(false)}
                      style={{ background: '#F1F5F9', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 18px', cursor: 'pointer', fontSize: 14 }}>Annuler</button>
                    <button type="submit" style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Enregistrer</button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    {['Nom', 'Province', 'Type', 'Articles', 'Statut', 'Dernière sync', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#374151', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sources.map(source => (
                    <tr key={source.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{source.name}</div>
                        {source.errorCount > 0 && <div style={{ fontSize: 12, color: '#EF4444' }}>⚠ {source.lastError?.substring(0, 50)}</div>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 12, background: source.province === 'NB' ? '#DBEAFE' : '#F1F5F9', color: source.province === 'NB' ? '#1E3A5F' : '#374151', padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>
                          {source.province || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{source.type}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{source.articlesCount}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 12, background: source.active ? '#DCFCE7' : '#FEF2F2', color: source.active ? '#166534' : '#991B1B', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
                          {source.active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>
                        {source.lastSyncAt ? new Date(source.lastSyncAt).toLocaleString('fr-CA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleScrapeOne(source.id)} style={{ background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', fontSize: 12 }}>
                            🔄 Sync
                          </button>
                          <button onClick={() => handleToggleSource(source)} style={{ background: source.active ? '#FEF2F2' : '#DCFCE7', color: source.active ? '#991B1B' : '#166534', border: 'none', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                            {source.active ? 'Désactiver' : 'Activer'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sources.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                  Aucune source. Connectez votre base de données et lancez le seed.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
