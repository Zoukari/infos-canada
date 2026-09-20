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
  { href: '/a-surveiller', label: 'À surveiller' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const pathname = usePathname()

  return (
    <header style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
          <img src="/maple-leaf.png" alt="" width={26} height={26} />
          <div>
            <div style={{ fontFamily: 'Source Serif 4, serif', fontSize: 18, fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>
              Infos Canada
            </div>
          </div>
        </Link>

        <form onSubmit={e => { e.preventDefault(); if (search.trim()) window.location.href = `/recherche?q=${encodeURIComponent(search)}` }}
          style={{ flex: 1, maxWidth: 320, display: 'flex', gap: 6, marginLeft: 'auto' }} className="hide-mobile">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            style={{ flex: 1, padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 13, outline: 'none', background: 'var(--paper)' }} />
        </form>

        <Link href="/admin" className="hide-mobile"
          style={{ fontSize: 12, color: '#9C9C9C', textDecoration: 'none', flexShrink: 0 }}>
          Admin
        </Link>

        <button onClick={() => setOpen(!open)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, display: 'none' }} className="burger-btn">
          {open ? '✕' : '☰'}
        </button>
      </div>

      <div className="hide-mobile" style={{ background: 'var(--card)', borderTop: '1px solid var(--border-soft)' }}>
        <div className="container" style={{ display: 'flex', overflowX: 'auto' }}>
          {NAV.map(item => (
            <Link key={item.href} href={item.href} style={{
              padding: '9px 14px', fontSize: 13, whiteSpace: 'nowrap', textDecoration: 'none',
              color: pathname === item.href ? 'var(--red)' : 'var(--ink-soft)',
              fontWeight: pathname === item.href ? 600 : 400,
              borderBottom: pathname === item.href ? '2px solid var(--red)' : '2px solid transparent',
            }}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {open && (
        <div style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', padding: '10px 20px 18px' }}>
          <form onSubmit={e => { e.preventDefault(); if (search.trim()) window.location.href = `/recherche?q=${encodeURIComponent(search)}` }}
            style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              style={{ flex: 1, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 14 }} />
          </form>
          {NAV.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{
              display: 'block', padding: '11px 2px', fontSize: 15, textDecoration: 'none',
              color: pathname === item.href ? 'var(--red)' : 'var(--ink)',
              fontWeight: pathname === item.href ? 600 : 400,
              borderBottom: '1px solid var(--border-soft)',
            }}>
              {item.label}
            </Link>
          ))}
          <Link href="/admin" onClick={() => setOpen(false)} style={{ display: 'block', padding: '11px 2px', fontSize: 14, textDecoration: 'none', color: '#9C9C9C', marginTop: 4 }}>
            Administration
          </Link>
        </div>
      )}

      <style>{`.burger-btn { display: flex !important; color: var(--ink); } @media (min-width: 769px) { .burger-btn { display: none !important; } }`}</style>
    </header>
  )
}
