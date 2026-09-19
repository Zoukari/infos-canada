'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/', label: 'Accueil' },
  { href: '/nouveau-brunswick', label: 'N.-Brunswick' },
  { href: '/immigration', label: 'Immigration' },
  { href: '/emploi', label: 'Emploi' },
  { href: '/logement', label: 'Logement' },
  { href: '/politique', label: 'Politique' },
  { href: '/economie', label: 'Économie' },
  { href: '/a-surveiller', label: '⚑ À surveiller' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const pathname = usePathname()

  return (
    <header style={{
      background: '#fff',
      borderBottom: '3px solid var(--red)',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,.07)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <img src="/favicon.svg" alt="" width={32} height={32} />
          <div>
            <div style={{ fontFamily: 'Source Serif 4, serif', fontSize: 18, fontWeight: 700, color: 'var(--red)', lineHeight: 1 }}>
              Infos Canada
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '.06em' }}>
              L&apos;essentiel chaque jour
            </div>
          </div>
        </Link>

        {/* Search — desktop */}
        <form onSubmit={e => { e.preventDefault(); if (search.trim()) window.location.href = `/recherche?q=${encodeURIComponent(search)}` }}
          style={{ flex: 1, maxWidth: 340, display: 'flex', gap: 6 }} className="hide-mobile">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            style={{ flex: 1, padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14, outline: 'none' }} />
          <button type="submit" style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 14 }}>→</button>
        </form>

        {/* Admin link — desktop */}
        <Link href="/admin" className="hide-mobile"
          style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 6, flexShrink: 0 }}>
          ⚙ Admin
        </Link>

        {/* Burger */}
        <button onClick={() => setOpen(!open)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, display: 'none' }} className="burger-btn">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Nav desktop */}
      <div className="hide-mobile" style={{ background: '#fff', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', overflowX: 'auto', padding: '0 16px' }}>
          {NAV.map(item => (
            <Link key={item.href} href={item.href} style={{
              padding: '9px 14px', fontSize: 13, whiteSpace: 'nowrap', textDecoration: 'none',
              color: pathname === item.href ? 'var(--red)' : 'var(--text)',
              fontWeight: pathname === item.href ? 600 : 400,
              borderBottom: pathname === item.href ? '2px solid var(--red)' : '2px solid transparent',
            }}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <div style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '8px 16px 16px' }}>
          <form onSubmit={e => { e.preventDefault(); if (search.trim()) window.location.href = `/recherche?q=${encodeURIComponent(search)}` }}
            style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              style={{ flex: 1, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }} />
            <button type="submit" style={{ background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 14px', cursor: 'pointer' }}>→</button>
          </form>
          {NAV.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{
              display: 'block', padding: '10px 4px', fontSize: 15, textDecoration: 'none',
              color: pathname === item.href ? 'var(--red)' : 'var(--text)',
              fontWeight: pathname === item.href ? 600 : 400,
              borderBottom: '1px solid var(--border)',
            }}>
              {item.label}
            </Link>
          ))}
          <Link href="/admin" onClick={() => setOpen(false)} style={{ display: 'block', padding: '10px 4px', fontSize: 15, textDecoration: 'none', color: 'var(--text-muted)', marginTop: 4 }}>
            ⚙ Administration
          </Link>
        </div>
      )}

      <style>{`.burger-btn { display: flex !important; } @media (min-width: 769px) { .burger-btn { display: none !important; } }`}</style>
    </header>
  )
}
