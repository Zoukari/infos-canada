'use client'
import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard from '@/components/ArticleCard'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const PROVINCES = [
  { value: '', label: 'Toutes provinces' },
  { value: 'NB', label: 'Nouveau-Brunswick' },
  { value: 'federal', label: 'Canada fédéral' },
  { value: 'QC', label: 'Québec' },
  { value: 'ON', label: 'Ontario' },
]

const CATEGORIES = [
  { value: '', label: 'Toutes catégories' },
  { value: 'immigration-nb', label: 'Immigration NB' },
  { value: 'entree-express', label: 'Entrée express' },
  { value: 'nbpnp', label: 'NBPNP' },
  { value: 'emploi-nb', label: 'Emploi NB' },
  { value: 'logement-nb', label: 'Logement NB' },
  { value: 'politique-nb', label: 'Politique NB' },
  { value: 'sante-nb', label: 'Santé NB' },
]

const POPULAR_SEARCHES = [
  'Entrée express', 'NBPNP', 'Moncton', 'Immigration Nouveau-Brunswick',
  'Loyer Dieppe', 'CRS', 'Fredericton', 'Francophone', 'IRCC', 'Résidence permanente',
]

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQ)
  const [inputValue, setInputValue] = useState(initialQ)
  const [province, setProvince] = useState('')
  const [category, setCategory] = useState('')
  const [articles, setArticles] = useState<unknown[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const doSearch = useCallback(async (q: string, prov: string, cat: string) => {
    if (!q.trim() && !prov && !cat) return
    setLoading(true)
    setSearched(true)
    try {
      const params = new URLSearchParams({ limit: '20' })
      if (q) params.set('search', q)
      if (prov) params.set('province', prov)
      if (cat) params.set('category', cat)
      const res = await fetch(`/api/articles?${params}`)
      const data = await res.json()
      setArticles(data.articles || [])
      setTotal(data.total || 0)
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialQ) doSearch(initialQ, '', '')
  }, [initialQ, doSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(inputValue)
    doSearch(inputValue, province, category)
    window.history.pushState({}, '', `/recherche?q=${encodeURIComponent(inputValue)}`)
  }

  type ArticleType = { id: string; title: string; slug: string; originalUrl: string; publishedAt: string; summary?: string | null; province?: string | null; city?: string | null; importanceScore: number; status: string; source: { name: string }; category?: { name: string; slug: string } | null }

  return (
    <>
      <Header />
      <main>
        {/* Hero recherche */}
        <div style={{ background: '#0F172A', padding: '44px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            <h1 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 20 }}>
              🔍 Rechercher dans Infos Canada
            </h1>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 10, maxWidth: 860 }}>
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Ex: Entrée express, Moncton, CRS, NBPNP…"
                style={{ padding: '12px 16px', fontSize: 15, border: 'none', borderRadius: 6, fontFamily: 'Inter' }}
              />
              <select value={province} onChange={e => setProvince(e.target.value)}
                style={{ padding: '12px 12px', border: 'none', borderRadius: 6, fontSize: 14 }}>
                {PROVINCES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <select value={category} onChange={e => setCategory(e.target.value)}
                style={{ padding: '12px 12px', border: 'none', borderRadius: 6, fontSize: 14 }}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <button type="submit" style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 24px', cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
                Chercher
              </button>
            </form>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
          {!searched ? (
            <div>
              <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 18, marginBottom: 16 }}>Recherches fréquentes</h2>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {POPULAR_SEARCHES.map(s => (
                  <button key={s} onClick={() => { setInputValue(s); setQuery(s); doSearch(s, '', '') }}
                    style={{ padding: '8px 16px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 20, fontSize: 14, cursor: 'pointer', color: 'var(--text)' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : loading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
              <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: 18 }}>Recherche en cours…</div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 20, color: 'var(--text-muted)', fontSize: 14 }}>
                {total} résultat{total > 1 ? 's' : ''} {query && `pour "${query}"`}
              </div>
              {articles.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--white)', border: '1px dashed var(--border)', borderRadius: 10 }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Aucun résultat</div>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Essayez d&apos;autres termes ou attendez la prochaine collecte automatique.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 14 }}>
                  {(articles as ArticleType[]).map(a => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function RecherchePage() {
  return (
    <Suspense fallback={<div>Chargement…</div>}>
      <SearchContent />
    </Suspense>
  )
}
