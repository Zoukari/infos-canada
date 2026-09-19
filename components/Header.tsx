'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: 'Accueil' },
  { href: '/nouveau-brunswick', label: 'Nouveau-Brunswick' },
  { href: '/canada', label: 'Canada' },
  { href: '/immigration', label: 'Immigration' },
  { href: '/politique', label: 'Politique' },
  { href: '/emploi', label: 'Emploi' },
  { href: '/logement', label: 'Logement' },
  { href: '/economie', label: 'Économie' },
  { href: '/sante', label: 'Santé' },
  { href: '/a-surveiller', label: '⚑ À surveiller' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const pathname = usePathname()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      window.location.href = `/recherche?q=${encodeURIComponent(searchValue.trim())}`
    }
  }

  return (
    <header style={{ background: 'var(--white)', borderBottom: '2px solid var(--red)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(0,0,0,.06)' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--red)', padding: '4px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
            {new Date().toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>Comprendre le Canada au quotidien</span>
        </div>
      </div>

      {/* Main header */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 28 }}>🇨🇦</span>
          <div>
            <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: 22, fontWeight: 700, color: 'var(--red)', lineHeight: 1.1 }}>Infos Canada</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>L&apos;essentiel chaque jour</div>
          </div>
        </Link>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 400 }}>
          {searchOpen ? (
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
              <input
                autoFocus
                type="text"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="Rechercher…"
                style={{ flex: 1, padding: '8px 12px', border: '2px solid var(--red)', borderRadius: 6, fontFamily: 'Inter', fontSize: 14, outline: 'none' }}
              />
              <button type="submit" style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 14 }}>→</button>
              <button type="button" onClick={() => setSearchOpen(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}>✕</button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, width: '100%', textAlign: 'left' }}>
              🔍 Rechercher…
            </button>
          )}
        </div>

        {/* Burger mobile */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: 'var(--text)' }} className="burger">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ background: 'var(--white)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 0, overflowX: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '10px 14px',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--red)' : 'var(--text)',
                  textDecoration: 'none',
                  borderBottom: active ? '2px solid var(--red)' : '2px solid transparent',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .burger { display: block !important; }
        }
      `}</style>
    </header>
  )
}
