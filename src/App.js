import React, { useEffect, useState, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { supabase, getSupportedCities, createBrokerSubscription, getBrokerActions, upsertBrokerAction } from './supabaseClient'

// ---------------------------------------------------------------------------
// DESIGN TOKENS
// ---------------------------------------------------------------------------
const t = {
  // Canvas layers
  bg: '#0d0d0f',
  surface: '#141416',
  elevated: '#1a1a1d',
  overlay: '#222226',
  border: '#2a2a2f',
  borderSubtle: '#1f1f24',

  // Text
  textPrimary: '#f0f0f2',
  textSecondary: '#a0a0aa',
  textMuted: '#5a5a66',

  // Accent
  accent: '#2563eb',
  accentHover: '#1d4ed8',
  accentSubtle: 'rgba(37,99,235,0.12)',

  // Semantic
  success: '#16a34a',
  successSubtle: 'rgba(22,163,74,0.12)',
  warning: '#d97706',
  warningSubtle: 'rgba(217,119,6,0.12)',
  danger: '#dc2626',
  dangerSubtle: 'rgba(220,38,38,0.12)',
  purple: '#7c3aed',
  purpleSubtle: 'rgba(124,58,237,0.12)',

  // Platform
  facebook: '#1d4ed8',
  craigslist: '#16a34a',
  offerup: '#d97706',

  // Radius
  radiusSm: '4px',
  radiusMd: '6px',
  radiusLg: '10px',
  radiusXl: '14px',
  radiusFull: '9999px',

  // Font
  font: "'Inter', -apple-system, sans-serif",
}

// ---------------------------------------------------------------------------
// HOOKS
// ---------------------------------------------------------------------------
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
function getInitials(email) {
  if (!email) return '?'
  const username = email.split('@')[0]
  const parts = username.split(/[._-]/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return username.slice(0, 2).toUpperCase()
}

function Avatar({ email, size = 32 }) {
  const initials = getInitials(email)
  return (
    <div style={{
      width: size, height: size, borderRadius: t.radiusFull,
      background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.38, fontWeight: '700',
      fontFamily: t.font, flexShrink: 0, letterSpacing: '0.02em',
    }}>
      {initials}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ICONS
// ---------------------------------------------------------------------------
function IconLeads({ color = t.textMuted, size = 17 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
}
function IconPipeline({ color = t.textMuted, size = 17 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
}
function IconAnalytics({ color = t.textMuted, size = 17 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>
}
function IconSignOut({ color = t.textMuted, size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
}
function IconChevron({ color = t.textMuted, size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
}
function IconCheck({ color = t.success, size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
}

// ---------------------------------------------------------------------------
// NOTIFICATION TOGGLE
// ---------------------------------------------------------------------------
function NotificationToggle({ label, desc, defaultOn }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
      <div>
        <p style={{ color: t.textPrimary, fontSize: '12px', fontWeight: '600', margin: '0 0 2px 0' }}>{label}</p>
        <p style={{ color: t.textMuted, fontSize: '11px', margin: 0 }}>{desc}</p>
      </div>
      <button onClick={() => setOn(!on)} style={{ flexShrink: 0, width: '34px', height: '18px', borderRadius: t.radiusFull, background: on ? t.accent : t.overlay, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.15s' }}>
        <div style={{ position: 'absolute', top: '2px', left: on ? '16px' : '2px', width: '14px', height: '14px', borderRadius: t.radiusFull, background: '#fff', transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PROFILE DROPDOWN
// ---------------------------------------------------------------------------
function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('menu')
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setView('menu') } }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const menuItems = [
    { id: 'profile', icon: '👤', label: 'My Profile' },
    { id: 'notifications', icon: '🔔', label: 'Notification Settings' },
    { id: 'support', icon: '💬', label: 'Help & Support' },
  ]

  const MenuItem = ({ onClick, children, danger }) => {
    const [hovered, setHovered] = useState(false)
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: hovered ? t.overlay : 'transparent', border: 'none', borderRadius: t.radiusMd, color: danger ? t.danger : t.textSecondary, cursor: 'pointer', fontSize: '13px', fontFamily: t.font, textAlign: 'left', transition: 'background 0.1s' }}
      >
        {children}
      </button>
    )
  }

  const sectionHeader = (
    <div style={{ padding: '11px 14px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button onClick={() => setView('menu')} style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', fontSize: '15px', padding: '0', lineHeight: 1 }}>←</button>
      <p style={{ color: t.textPrimary, fontSize: '13px', fontWeight: '600', margin: 0 }}>
        {view === 'profile' ? 'My Profile' : view === 'notifications' ? 'Notification Settings' : 'Help & Support'}
      </p>
    </div>
  )

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(!open); setView('menu') }}
        style={{ background: 'transparent', border: `1px solid ${open ? t.border : 'transparent'}`, borderRadius: t.radiusFull, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '3px', transition: 'border-color 0.15s' }}
      >
        <Avatar email={user.email} size={30} />
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: '42px', background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.radiusLg, minWidth: '240px', zIndex: 200, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>

          {view === 'menu' && (
            <>
              {/* Identity header */}
              <div style={{ padding: '14px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Avatar email={user.email} size={36} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: t.textPrimary, fontSize: '13px', fontWeight: '600', margin: '0 0 1px 0' }}>
                    {user.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </p>
                  <p style={{ color: t.textMuted, fontSize: '11px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                </div>
              </div>

              {/* Plan badge */}
              <div style={{ padding: '8px 14px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: t.textMuted, fontSize: '11px' }}>Plan</span>
                <span style={{ background: t.successSubtle, color: t.success, fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: t.radiusFull, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Early Access</span>
              </div>

              {/* Nav items */}
              <div style={{ padding: '6px' }}>
                {menuItems.map(item => (
                  <MenuItem key={item.id} onClick={() => setView(item.id)}>
                    <span style={{ fontSize: '14px', width: '18px' }}>{item.icon}</span>
                    {item.label}
                  </MenuItem>
                ))}
              </div>

              {/* Sign out */}
              <div style={{ padding: '6px', borderTop: `1px solid ${t.border}` }}>
                <MenuItem danger onClick={() => { setOpen(false); onLogout() }}>
                  <IconSignOut color={t.danger} size={14} />
                  Sign Out
                </MenuItem>
              </div>
            </>
          )}

          {view === 'profile' && (
            <>
              {sectionHeader}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Email', value: user.email },
                  { label: 'Market', value: 'Miami, FL' },
                  { label: 'Scrape Schedule', value: '9:00 AM & 5:00 PM ET daily' },
                ].map(item => (
                  <div key={item.label}>
                    <p style={{ color: t.textMuted, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px 0' }}>{item.label}</p>
                    <p style={{ color: t.textPrimary, fontSize: '13px', margin: 0, wordBreak: 'break-all' }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {view === 'notifications' && (
            <>
              {sectionHeader}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <NotificationToggle label="New Lead Alerts" desc="Email when new motivated sellers are found" defaultOn={true} />
                <NotificationToggle label="Follow Up Reminders" desc="Daily 9am reminder for leads due today" defaultOn={true} />
                <NotificationToggle label="Price Drop Alerts" desc="Notify when a listing drops in price" defaultOn={false} />
                <p style={{ color: t.textMuted, fontSize: '11px', margin: 0 }}>Changes take effect on the next scrape cycle.</p>
              </div>
            </>
          )}

          {view === 'support' && (
            <>
              {sectionHeader}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ color: t.textSecondary, fontSize: '12px', margin: 0, lineHeight: '1.6' }}>Have a question or found a bug? Reach out and we'll get back to you within 24 hours.</p>
                <a href="mailto:support@getyachtwatch.com" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: t.overlay, borderRadius: t.radiusMd, color: t.accent, fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>
                  📧 support@getyachtwatch.com
                </a>
                <div style={{ background: t.overlay, borderRadius: t.radiusMd, padding: '12px' }}>
                  <p style={{ color: t.textPrimary, fontSize: '12px', fontWeight: '600', margin: '0 0 8px 0' }}>Quick Tips</p>
                  {['Leads refresh at 9am and 5pm ET daily', 'Use Pipeline to track active conversations', 'Set follow up dates to get email reminders', 'Search by boat make, location, or title'].map(tip => (
                    <p key={tip} style={{ color: t.textMuted, fontSize: '11px', margin: '0 0 4px 0' }}>• {tip}</p>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// KPI STAT CARD
// ---------------------------------------------------------------------------
function KpiCard({ label, value, delta, deltaLabel, color }) {
  const isPositive = delta > 0
  const isNeutral = delta === 0
  const deltaColor = isNeutral ? t.textMuted : isPositive ? t.success : t.danger
  const deltaSymbol = isPositive ? '↑' : isNeutral ? '—' : '↓'
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: t.radiusLg, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0 }}>
      <p style={{ color: t.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0, fontWeight: '500' }}>{label}</p>
      <p style={{ color, fontSize: '28px', fontWeight: '800', margin: 0, lineHeight: 1, fontFeatureSettings: '"tnum"' }}>{value}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ color: deltaColor, fontSize: '12px', fontWeight: '600' }}>{deltaSymbol} {Math.abs(delta)}</span>
        <span style={{ color: t.textMuted, fontSize: '11px' }}>{deltaLabel}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SIDEBAR / BOTTOM NAV
// ---------------------------------------------------------------------------
function Sidebar({ activePage, setActivePage, onLogout, isMobile, user }) {
  const [hovered, setHovered] = useState(false)
  const navItems = [
    { id: 'leads', label: 'Leads', Icon: IconLeads },
    { id: 'pipeline', label: 'Pipeline', Icon: IconPipeline },
    { id: 'analytics', label: 'Analytics', Icon: IconAnalytics },
  ]

  if (isMobile) {
    return (
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: t.surface, borderTop: `1px solid ${t.border}`, display: 'flex', zIndex: 100 }}>
        {navItems.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActivePage(id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: t.font, color: activePage === id ? t.accent : t.textMuted, borderTop: activePage === id ? `2px solid ${t.accent}` : '2px solid transparent' }}>
            <Icon color={activePage === id ? t.accent : t.textMuted} size={20} />
            <span style={{ fontSize: '10px', marginTop: '2px' }}>{label}</span>
          </button>
        ))}
        <button style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: t.font, color: t.textMuted, borderTop: '2px solid transparent' }} onClick={onLogout}>
          <IconSignOut color={t.textMuted} size={20} />
          <span style={{ fontSize: '10px', marginTop: '2px' }}>Out</span>
        </button>
      </div>
    )
  }

  return (
    <div
      style={{ background: t.surface, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', width: hovered ? '200px' : '52px', transition: 'width 0.2s ease', overflow: 'hidden' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Logo */}
      <div style={{ padding: '14px', borderBottom: `1px solid ${t.border}`, height: '56px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <img src="/yachtwatch-logo.png" alt="YachtWatch" style={{ height: '26px', objectFit: 'contain', opacity: hovered ? 1 : 0, transition: 'opacity 0.15s', whiteSpace: 'nowrap', minWidth: '120px' }} />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 6px', overflowY: 'auto' }}>
        {navItems.map(({ id, label, Icon }) => {
          const active = activePage === id
          return (
            <button key={id} onClick={() => setActivePage(id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: t.radiusMd, cursor: 'pointer', border: 'none', background: active ? t.accentSubtle : 'transparent', color: active ? t.accent : t.textMuted, fontSize: '13px', fontWeight: active ? '600' : '500', fontFamily: t.font, width: '100%', textAlign: 'left', transition: 'background 0.1s, color 0.1s', justifyContent: hovered ? 'flex-start' : 'center', borderLeft: active ? `2px solid ${t.accent}` : '2px solid transparent', marginLeft: '-2px', paddingLeft: active ? '10px' : '10px' }}>
              <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}><Icon color={active ? t.accent : t.textMuted} size={17} /></span>
              {hovered && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{label}</span>}
            </button>
          )
        })}
      </nav>

      {/* User block pinned to bottom */}
      <div style={{ borderTop: `1px solid ${t.border}`, padding: '10px 6px', flexShrink: 0 }}>
        <button
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: t.radiusMd, cursor: 'pointer', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', fontFamily: t.font, justifyContent: hovered ? 'flex-start' : 'center', transition: 'background 0.1s' }}
          onMouseEnter={e => e.currentTarget.style.background = t.overlay}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Avatar email={user?.email} size={28} />
          {hovered && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ color: t.textPrimary, fontSize: '12px', fontWeight: '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email?.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </p>
              <p style={{ color: t.textMuted, fontSize: '10px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// LANDING PAGE
// ---------------------------------------------------------------------------
function LandingPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  return (
    <div style={{ background: t.bg, minHeight: '100vh', color: t.textPrimary, fontFamily: t.font }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '16px 20px' : '20px 60px', borderBottom: `1px solid ${t.borderSubtle}`, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <img src="/yachtwatch-logo.png" alt="YachtWatch" style={{ height: isMobile ? '36px' : '48px', objectFit: 'contain' }} />
        <button style={{ background: 'transparent', border: `1px solid rgba(255,255,255,0.15)`, borderRadius: t.radiusMd, color: t.textPrimary, padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontFamily: t.font }} onClick={() => navigate('/login')}>Sign In</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(13,13,15,1)), url(/hero-yacht.png)', backgroundSize: 'cover', backgroundPosition: 'center', padding: isMobile ? '120px 24px 60px' : '160px 60px' }}>
        <div style={{ maxWidth: isMobile ? '100%' : '720px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: t.accentSubtle, border: `1px solid ${t.accent}`, color: '#93c5fd', fontSize: '11px', fontWeight: '600', padding: '4px 12px', borderRadius: t.radiusFull, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Motivated Seller Intelligence</div>
          <h1 style={{ fontSize: isMobile ? '32px' : '52px', fontWeight: '800', lineHeight: '1.1', margin: '0 0 20px 0', color: t.textPrimary }}>Find Motivated Boat Sellers<br />Before Anyone Else Does</h1>
          <p style={{ fontSize: isMobile ? '15px' : '18px', color: 'rgba(240,240,242,0.65)', lineHeight: '1.7', margin: '0 0 32px 0' }}>The best listings never hit the MLS. They're sitting on Facebook Marketplace and Craigslist, posted by owners who need out fast. We find them before anyone else does and put them in your inbox twice a day.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexDirection: isMobile ? 'column' : 'row' }}>
            <button style={{ background: t.accent, color: '#fff', border: 'none', borderRadius: t.radiusMd, padding: '14px 28px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', width: isMobile ? '100%' : 'auto', fontFamily: t.font }} onClick={() => navigate('/signup')}>Get Early Access</button>
            <button style={{ background: 'transparent', color: t.textPrimary, border: `1px solid rgba(255,255,255,0.15)`, borderRadius: t.radiusMd, padding: '14px 28px', fontSize: '15px', cursor: 'pointer', width: isMobile ? '100%' : 'auto', fontFamily: t.font }} onClick={() => navigate('/login')}>Sign In</button>
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? '60px 24px' : '80px 60px', borderTop: `1px solid ${t.borderSubtle}` }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', textAlign: 'center', margin: '0 0 48px 0' }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '32px' : '40px', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { num: '01', title: 'We Scrape', text: 'We scan Facebook Marketplace, Craigslist, and OfferUp every morning and afternoon for private sellers listing boats over $50k in your market.' },
            { num: '02', title: 'We Filter', text: 'We read every description looking for the signals you already know — moving out of state, health reasons, behind on slip fees, repo, estate sales.' },
            { num: '03', title: 'You Close', text: 'You get an email the moment a lead comes in. Open the dashboard, read the description, and reach out before anyone else knows it exists.' },
          ].map(s => (
            <div key={s.num} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', fontWeight: '800', color: t.borderSubtle, marginBottom: '12px' }}>{s.num}</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: t.textPrimary }}>{s.title}</h3>
              <p style={{ fontSize: '14px', color: t.textSecondary, lineHeight: '1.7', margin: 0 }}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px', padding: isMobile ? '40px 24px' : '80px 60px', borderTop: `1px solid ${t.borderSubtle}` }}>
        {[
          { icon: '📍', title: 'Three Platforms', text: 'Facebook has the volume. Craigslist has the hidden gems. OfferUp catches what the others miss.' },
          { icon: '🚨', title: 'Motivated Seller Detection', text: "We're not just looking for boats for sale. We're looking for owners who need to sell." },
          { icon: '📧', title: 'Instant Email Alerts', text: 'The broker who calls first wins the listing. We make sure that broker is you.' },
          { icon: '📋', title: 'Built-in CRM', text: 'Track every conversation, set follow up reminders, and add notes on each seller.' },
        ].map(v => (
          <div key={v.title} style={{ background: t.surface, borderRadius: t.radiusXl, padding: '24px', border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>{v.icon}</div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px', color: t.textPrimary }}>{v.title}</h3>
            <p style={{ fontSize: '13px', color: t.textSecondary, lineHeight: '1.7', margin: 0 }}>{v.text}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: isMobile ? '60px 24px' : '100px 60px', borderTop: `1px solid ${t.borderSubtle}` }}>
        <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', margin: '0 0 14px 0' }}>Built by brokers, for brokers.</h2>
        <p style={{ fontSize: '15px', color: t.textSecondary, margin: '0 0 32px 0' }}>Stop scrolling Marketplace manually. Let the leads come to you.</p>
        <button style={{ background: t.accent, color: '#fff', border: 'none', borderRadius: t.radiusMd, padding: '14px 28px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', width: isMobile ? '100%' : 'auto', fontFamily: t.font }} onClick={() => navigate('/signup')}>Get Early Access</button>
      </div>

      <div style={{ padding: isMobile ? '24px' : '32px 60px', borderTop: `1px solid ${t.borderSubtle}`, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src="/yachtwatch-logo.png" alt="YachtWatch" style={{ height: '36px', objectFit: 'contain', marginBottom: '12px', opacity: 0.4 }} />
        <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>© 2025 YachtWatch. Built for yacht brokers.</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AUTH PAGES
// ---------------------------------------------------------------------------
function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const handleLogin = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }
  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.font, padding: '20px' }}>
      <div style={{ background: t.surface, padding: '32px', borderRadius: t.radiusXl, width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '14px', border: `1px solid ${t.border}` }}>
        <img src="/yachtwatch-logo.png" alt="YachtWatch" style={{ height: '52px', objectFit: 'contain', margin: '0 auto', cursor: 'pointer' }} onClick={() => navigate('/')} />
        <h2 style={{ color: t.textPrimary, fontSize: '20px', margin: 0, textAlign: 'center' }}>Sign In</h2>
        <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        {error && <p style={{ color: t.danger, fontSize: '13px', margin: 0 }}>{error}</p>}
        <button style={primaryBtnStyle} onClick={handleLogin} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        <p style={{ color: t.textMuted, fontSize: '13px', textAlign: 'center', margin: 0 }}>Don't have an account?{' '}<span style={{ color: t.accent, cursor: 'pointer' }} onClick={() => navigate('/signup')}>Sign up</span></p>
      </div>
    </div>
  )
}

function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cities, setCities] = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  useEffect(() => { getSupportedCities().then(data => setCities(data)) }, [])
  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password || !selectedCity) { setError('Please fill in all fields'); return }
    setLoading(true); setError('')
    const { error: signupError } = await supabase.auth.signUp({ email, password })
    if (signupError) { setError(signupError.message); setLoading(false); return }
    const city = cities.find(c => c.id === selectedCity)
    if (city) await createBrokerSubscription({ full_name: `${firstName} ${lastName}`, email }, city)
    setSuccess(true); setLoading(false)
  }
  if (success) return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.font, padding: '20px' }}>
      <div style={{ background: t.surface, padding: '32px', borderRadius: t.radiusXl, width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '14px', border: `1px solid ${t.border}` }}>
        <img src="/yachtwatch-logo.png" alt="YachtWatch" style={{ height: '52px', objectFit: 'contain', margin: '0 auto' }} />
        <h2 style={{ color: t.textPrimary, fontSize: '20px', margin: 0, textAlign: 'center' }}>You're all set 🚤</h2>
        <p style={{ color: t.textSecondary, fontSize: '14px', textAlign: 'center', margin: 0 }}>Welcome to YachtWatch. Leads will start hitting your inbox at 9am and 5pm daily.</p>
        <button style={primaryBtnStyle} onClick={() => navigate('/login')}>Go to Dashboard</button>
      </div>
    </div>
  )
  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.font, padding: '20px' }}>
      <div style={{ background: t.surface, padding: '32px', borderRadius: t.radiusXl, width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '14px', border: `1px solid ${t.border}` }}>
        <img src="/yachtwatch-logo.png" alt="YachtWatch" style={{ height: '52px', objectFit: 'contain', margin: '0 auto', cursor: 'pointer' }} onClick={() => navigate('/')} />
        <h2 style={{ color: t.textPrimary, fontSize: '20px', margin: 0, textAlign: 'center' }}>Get Early Access</h2>
        <p style={{ color: t.textMuted, fontSize: '13px', textAlign: 'center', margin: 0 }}>Select your market and we'll start surfacing leads immediately.</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input style={{ ...inputStyle, width: '50%' }} type="text" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} />
          <input style={{ ...inputStyle, width: '50%' }} type="text" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>
        <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <select style={{ ...inputStyle, cursor: 'pointer' }} value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
          <option value="">Select your market</option>
          {cities.map(city => <option key={city.id} value={city.id}>{city.city_label}, {city.state}</option>)}
        </select>
        {error && <p style={{ color: t.danger, fontSize: '13px', margin: 0 }}>{error}</p>}
        <button style={primaryBtnStyle} onClick={handleSignup} disabled={loading}>{loading ? 'Creating account...' : 'Request Access'}</button>
        <p style={{ color: t.textMuted, fontSize: '13px', textAlign: 'center', margin: 0 }}>Already have an account?{' '}<span style={{ color: t.accent, cursor: 'pointer' }} onClick={() => navigate('/login')}>Sign in</span></p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// LEAD CARD
// ---------------------------------------------------------------------------
function LeadCard({ lead, brokerEmail, action, onActionChange }) {
  const [status, setStatus] = useState(action?.status || 'new')
  const [followUpDate, setFollowUpDate] = useState(action?.follow_up_date || '')
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [notes, setNotes] = useState(action?.notes || '')
  const [editingNotes, setEditingNotes] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)

  const handleStatus = async (newStatus) => {
    setStatus(newStatus)
    await upsertBrokerAction(brokerEmail, lead.listing_id, { status: newStatus })
    if (onActionChange) onActionChange()
  }
  const handleFollowUp = async () => {
    await upsertBrokerAction(brokerEmail, lead.listing_id, { follow_up_date: followUpDate })
    setShowFollowUp(false)
  }
  const handleSaveNotes = async () => {
    setSavingNotes(true)
    await upsertBrokerAction(brokerEmail, lead.listing_id, { notes })
    setSavingNotes(false); setEditingNotes(false)
  }

  const statusColors = { new: t.accent, reached_out: t.success, not_interested: t.danger, follow_up: t.warning, connected: t.purple }
  const statusLabels = { new: 'New', reached_out: 'Reached Out', not_interested: 'Not Interested', follow_up: 'Follow Up', connected: 'Connected' }
  const platformColors = { facebook: t.facebook, craigslist: t.craigslist, offerup: t.offerup }
  const platform = lead.platform || 'facebook'
  const platformColor = platformColors[platform] || t.facebook
  const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1)
  const hasKeywords = lead.matched_keywords?.length > 0
  const hasPriceSignal = lead.discount_percent >= 20
  const photos = lead.photos?.length > 0 ? lead.photos : lead.image_url ? [lead.image_url] : []

  const getDaysAgo = (dateStr) => {
    if (!dateStr) return null
    const diff = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today'
    if (diff === 1) return '1 day ago'
    return `${diff} days ago`
  }

  return (
    <div style={{ background: t.surface, borderRadius: t.radiusXl, overflow: 'hidden', border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', borderTop: `2px solid ${statusColors[status] || t.accent}` }}>
      <div style={{ background: platformColor, padding: '4px 12px' }}>
        <span style={{ color: '#fff', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{platformLabel}</span>
      </div>
      {(hasKeywords || hasPriceSignal) && (
        <div style={{ background: t.bg, borderBottom: `1px solid ${t.border}`, padding: '6px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {hasKeywords && <span style={{ background: 'rgba(127,29,29,0.5)', color: '#fca5a5', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: t.radiusFull, border: '1px solid rgba(220,38,38,0.3)' }}>🚨 {lead.matched_keywords.join(' · ')}</span>}
          {hasPriceSignal && <span style={{ background: t.accentSubtle, color: '#93c5fd', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: t.radiusFull, border: `1px solid rgba(37,99,235,0.3)` }}>📉 {lead.discount_percent}% below avg</span>}
        </div>
      )}
      {photos.length > 0 && (
        <div style={{ position: 'relative' }}>
          <img src={photos[photoIndex]} alt={lead.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
          {photos.length > 1 && (
            <>
              <button onClick={() => setPhotoIndex(i => Math.max(0, i - 1))} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', fontSize: '20px', width: '30px', height: '30px', borderRadius: t.radiusFull, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: photoIndex === 0 ? 0.3 : 1 }} disabled={photoIndex === 0}>‹</button>
              <button onClick={() => setPhotoIndex(i => Math.min(photos.length - 1, i + 1))} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', fontSize: '20px', width: '30px', height: '30px', borderRadius: t.radiusFull, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: photoIndex === photos.length - 1 ? 0.3 : 1 }} disabled={photoIndex === photos.length - 1}>›</button>
              <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: t.radiusFull }}>{photoIndex + 1} / {photos.length}</div>
            </>
          )}
        </div>
      )}
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ color: t.textPrimary, fontSize: '14px', margin: 0, fontWeight: '600', lineHeight: '1.4' }}>{lead.title}</h3>
        <span style={{ color: t.textPrimary, fontSize: '22px', fontWeight: '800', fontFeatureSettings: '"tnum"' }}>${lead.price?.toLocaleString()}</span>
        <div style={{ background: t.elevated, borderRadius: t.radiusMd, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[['Year', lead.boat_year], ['Make', lead.boat_make], ['Model', lead.boat_model], ['Engine Hours', lead.engine_hours], ['Trailer', lead.has_trailer]].filter(([, v]) => v).map(([label, value]) => (
            <div key={label} style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
              <span style={{ color: t.textMuted, minWidth: '90px' }}>{label}</span>
              <span style={{ color: t.textPrimary, fontWeight: '500' }}>{value}</span>
            </div>
          ))}
        </div>
        {lead.location && <p style={{ color: t.textSecondary, fontSize: '12px', margin: 0 }}>📍 {lead.location}</p>}
        {lead.listing_date && <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>📅 Listed: {getDaysAgo(lead.listing_date)}</p>}
        <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>🕐 Found: {new Date(lead.posted_at).toLocaleDateString()}</p>
        <a href={lead.url} target="_blank" rel="noreferrer" style={{ color: t.accent, fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>View Listing →</a>
        <div style={{ marginTop: '2px' }}>
          {editingNotes ? (
            <>
              <textarea style={{ ...inputStyle, width: '100%', resize: 'vertical', boxSizing: 'border-box' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes about this seller..." rows={3} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button onClick={handleSaveNotes} style={saveBtnStyle} disabled={savingNotes}>{savingNotes ? 'Saving...' : 'Save'}</button>
                <button onClick={() => setEditingNotes(false)} style={cancelBtnStyle}>Cancel</button>
              </div>
            </>
          ) : (
            <div onClick={() => setEditingNotes(true)} style={{ cursor: 'pointer', borderRadius: t.radiusMd, padding: '6px 8px', border: `1px dashed ${t.border}` }}>
              {notes ? <p style={{ color: t.textSecondary, fontSize: '12px', margin: 0 }}>📝 {notes}</p> : <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>+ Add notes</p>}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '4px' }}>
          {['reached_out', 'follow_up', 'connected', 'not_interested'].map(s => (
            <button key={s} onClick={() => { handleStatus(s); if (s === 'follow_up') setShowFollowUp(true) }}
              style={{ border: `1px solid ${statusColors[s]}`, borderRadius: t.radiusMd, padding: '4px 8px', fontSize: '10px', cursor: 'pointer', fontWeight: '600', fontFamily: t.font, background: status === s ? statusColors[s] : 'transparent', color: status === s ? '#fff' : statusColors[s], transition: 'all 0.1s' }}>
              {statusLabels[s]}
            </button>
          ))}
        </div>
        {showFollowUp && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} style={dateInputStyle} />
            <button onClick={handleFollowUp} style={saveBtnStyle}>Save</button>
          </div>
        )}
        {followUpDate && status === 'follow_up' && (
          <p style={{ color: t.warning, fontSize: '12px', margin: 0 }}>📅 Follow up: {new Date(followUpDate).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PIPELINE ROW
// ---------------------------------------------------------------------------
function PipelineRow({ lead, brokerEmail, action, onActionChange, isMobile }) {
  const [status, setStatus] = useState(action?.status || 'new')
  const [followUpDate, setFollowUpDate] = useState(action?.follow_up_date || '')
  const [notes, setNotes] = useState(action?.notes || '')
  const [editingNotes, setEditingNotes] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleStatus = async (newStatus) => { setStatus(newStatus); await upsertBrokerAction(brokerEmail, lead.listing_id, { status: newStatus }); if (onActionChange) onActionChange() }
  const handleFollowUp = async () => { await upsertBrokerAction(brokerEmail, lead.listing_id, { follow_up_date: followUpDate }) }
  const handleSaveNotes = async () => { setSavingNotes(true); await upsertBrokerAction(brokerEmail, lead.listing_id, { notes }); setSavingNotes(false); setEditingNotes(false) }

  const statusColors = { new: t.accent, reached_out: t.success, not_interested: t.danger, follow_up: t.warning, connected: t.purple }
  const statusLabels = { new: 'New', reached_out: 'Reached Out', not_interested: 'Not Interested', follow_up: 'Follow Up', connected: 'Connected' }
  const platformColors = { facebook: t.facebook, craigslist: t.craigslist, offerup: t.offerup }
  const platform = lead.platform || 'facebook'
  const platformColor = platformColors[platform] || t.facebook
  const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1)
  const photo = lead.photos?.[0] || lead.image_url

  const getFollowUpColor = () => {
    if (!followUpDate) return t.textMuted
    const today = new Date().toISOString().split('T')[0]
    if (followUpDate < today) return t.danger
    if (followUpDate === today) return t.warning
    return t.success
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: `1px solid ${t.borderSubtle}`, cursor: 'pointer', borderLeft: `2px solid ${statusColors[status] || t.accent}` }} onClick={() => setExpanded(!expanded)}>
        <div style={{ flexShrink: 0 }}>
          {photo ? <img src={photo} alt={lead.title} style={{ width: '54px', height: '54px', objectFit: 'cover', borderRadius: t.radiusMd }} />
            : <div style={{ width: '54px', height: '54px', background: t.elevated, borderRadius: t.radiusMd, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textMuted, fontSize: '20px' }}>🚤</div>}
        </div>
        <div style={{ flex: 2, minWidth: isMobile ? '120px' : 'auto' }}>
          <p style={{ color: t.textPrimary, fontWeight: '600', fontSize: '13px', margin: '0 0 3px 0' }}>{lead.title}</p>
          <p style={{ color: t.textSecondary, fontSize: '11px', margin: 0 }}>📍 {lead.location || 'Unknown'}</p>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: t.textPrimary, fontWeight: '700', fontSize: '14px', margin: 0, fontFeatureSettings: '"tnum"' }}>${lead.price?.toLocaleString()}</p>
          <div style={{ display: 'inline-block', background: platformColor, borderRadius: t.radiusSm, padding: '2px 5px', fontSize: '9px', color: '#fff', fontWeight: '700', marginTop: '3px' }}>{platformLabel}</div>
        </div>
        {!isMobile && (
          <>
            <div style={{ flex: 1 }}><span style={{ background: statusColors[status], color: '#fff', borderRadius: t.radiusSm, padding: '3px 8px', fontSize: '10px', fontWeight: '700' }}>{statusLabels[status]}</span></div>
            <div style={{ flex: 1 }}>{followUpDate ? <p style={{ color: getFollowUpColor(), fontSize: '11px', margin: 0, fontWeight: '600' }}>📅 {new Date(followUpDate).toLocaleDateString()}</p> : <p style={{ color: t.textMuted, fontSize: '11px', margin: 0 }}>No follow up</p>}</div>
            <div style={{ flex: 2 }}><p style={{ color: t.textSecondary, fontSize: '11px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{notes || '+ Add notes'}</p></div>
          </>
        )}
        <div style={{ color: t.textMuted, fontSize: '11px' }}>{expanded ? '▲' : '▼'}</div>
      </div>
      {expanded && (
        <div style={{ background: t.bg, padding: '16px 20px 20px', borderBottom: `1px solid ${t.borderSubtle}`, paddingLeft: isMobile ? '16px' : '100px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ width: '100%' }}>
              <p style={{ color: t.textMuted, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Status</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['reached_out', 'follow_up', 'connected', 'not_interested'].map(s => (
                  <button key={s} onClick={e => { e.stopPropagation(); handleStatus(s) }}
                    style={{ border: `1px solid ${statusColors[s]}`, borderRadius: t.radiusMd, padding: '4px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: '600', fontFamily: t.font, background: status === s ? statusColors[s] : 'transparent', color: status === s ? '#fff' : statusColors[s] }}>
                    {['reached_out', 'follow_up', 'connected', 'not_interested'].map(x => ({ [x]: { new: 'New', reached_out: 'Reached Out', not_interested: 'Not Interested', follow_up: 'Follow Up', connected: 'Connected' }[x] }))[0][s]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ color: t.textMuted, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Follow Up Date</p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} style={dateInputStyle} onClick={e => e.stopPropagation()} />
                <button onClick={e => { e.stopPropagation(); handleFollowUp() }} style={saveBtnStyle}>Save</button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <a href={lead.url} target="_blank" rel="noreferrer" style={{ color: t.accent, fontSize: '13px', textDecoration: 'none', fontWeight: '600' }} onClick={e => e.stopPropagation()}>View Listing →</a>
            </div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <p style={{ color: t.textMuted, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Notes</p>
            {editingNotes ? (
              <div onClick={e => e.stopPropagation()}>
                <textarea style={{ ...inputStyle, width: '100%', resize: 'vertical', boxSizing: 'border-box' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes about this seller..." rows={3} />
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button onClick={e => { e.stopPropagation(); handleSaveNotes() }} style={saveBtnStyle} disabled={savingNotes}>{savingNotes ? 'Saving...' : 'Save'}</button>
                  <button onClick={e => { e.stopPropagation(); setEditingNotes(false) }} style={cancelBtnStyle}>Cancel</button>
                </div>
              </div>
            ) : (
              <div onClick={e => { e.stopPropagation(); setEditingNotes(true) }} style={{ cursor: 'pointer', borderRadius: t.radiusMd, padding: '6px 8px', border: `1px dashed ${t.border}`, width: '100%', boxSizing: 'border-box' }}>
                {notes ? <p style={{ color: t.textSecondary, fontSize: '12px', margin: 0 }}>📝 {notes}</p> : <p style={{ color: t.textMuted, fontSize: '12px', margin: 0 }}>+ Add notes</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// LEADS PAGE
// ---------------------------------------------------------------------------
function LeadsPage({ leads, actions, brokerEmail, onActionChange, loading, isMobile }) {
  const [activeTab, setActiveTab] = useState('new')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minYear, setMinYear] = useState('')
  const [maxYear, setMaxYear] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [maxDaysAgo, setMaxDaysAgo] = useState('')
  const [sortBy, setSortBy] = useState('newest_found')

  const getStatus = (lead) => actions[lead.listing_id]?.status || 'new'

  const filteredLeads = leads
    .filter(lead => {
      const status = getStatus(lead)
      if (activeTab === 'new' && status !== 'new') return false
      if (activeTab === 'not_interested' && status !== 'not_interested') return false
      if (minPrice && lead.price < parseInt(minPrice)) return false
      if (maxPrice && lead.price > parseInt(maxPrice)) return false
      if (minYear && lead.boat_year && parseInt(lead.boat_year) < parseInt(minYear)) return false
      if (maxYear && lead.boat_year && parseInt(lead.boat_year) > parseInt(maxYear)) return false
      if (platformFilter !== 'all' && lead.platform !== platformFilter) return false
      if (maxDaysAgo && lead.listing_date) {
        const days = Math.floor((new Date() - new Date(lead.listing_date)) / (1000 * 60 * 60 * 24))
        if (days > parseInt(maxDaysAgo)) return false
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low': return (a.price || 0) - (b.price || 0)
        case 'price_high': return (b.price || 0) - (a.price || 0)
        case 'year_high': return parseInt(b.boat_year || 0) - parseInt(a.boat_year || 0)
        case 'year_low': return parseInt(a.boat_year || 0) - parseInt(b.boat_year || 0)
        case 'newest_listed': return new Date(b.listing_date || 0) - new Date(a.listing_date || 0)
        case 'oldest_listed': return new Date(a.listing_date || 0) - new Date(b.listing_date || 0)
        case 'most_discounted': return (b.discount_percent || 0) - (a.discount_percent || 0)
        case 'newest_found': return new Date(b.posted_at) - new Date(a.posted_at)
        case 'oldest_found': return new Date(a.posted_at) - new Date(b.posted_at)
        default: return 0
      }
    })

  return (
    <div style={{ flex: 1, overflowY: 'auto', color: t.textPrimary }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '12px 16px' : '14px 28px', borderBottom: `1px solid ${t.border}`, gap: '12px', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[{ id: 'new', label: 'New Leads' }, { id: 'not_interested', label: 'Not Interested' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ background: activeTab === tab.id ? t.accent : 'transparent', color: activeTab === tab.id ? '#fff' : t.textMuted, border: `1px solid ${activeTab === tab.id ? t.accent : t.border}`, borderRadius: t.radiusMd, padding: isMobile ? '6px 12px' : '7px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: t.font, transition: 'all 0.1s' }}>
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: isMobile ? '8px' : '0' }}>
          <select style={selectStyle} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest_found">Newest Found</option>
            <option value="oldest_found">Oldest Found</option>
            <option value="price_low">Price Low → High</option>
            <option value="price_high">Price High → Low</option>
            <option value="year_high">Year Newest First</option>
            <option value="year_low">Year Oldest First</option>
            <option value="newest_listed">Newest Listed</option>
            <option value="oldest_listed">Oldest Listed</option>
            <option value="most_discounted">Most Discounted</option>
          </select>
          <select style={selectStyle} value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="craigslist">Craigslist</option>
            <option value="offerup">OfferUp</option>
          </select>
          <input style={{ ...filterInputStyle, width: '76px' }} type="number" placeholder="Min $" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
          <input style={{ ...filterInputStyle, width: '76px' }} type="number" placeholder="Max $" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          <input style={{ ...filterInputStyle, width: '68px' }} type="number" placeholder="Min yr" value={minYear} onChange={e => setMinYear(e.target.value)} />
          <input style={{ ...filterInputStyle, width: '68px' }} type="number" placeholder="Max yr" value={maxYear} onChange={e => setMaxYear(e.target.value)} />
          <select style={selectStyle} value={maxDaysAgo} onChange={e => setMaxDaysAgo(e.target.value)}>
            <option value="">Any age</option>
            <option value="1">Today</option>
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>
      </div>
      {loading ? <p style={{ color: t.textMuted, textAlign: 'center', padding: '60px' }}>Loading leads...</p> : filteredLeads.length === 0 ? <p style={{ color: t.textMuted, textAlign: 'center', padding: '60px' }}>No leads match your filters.</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '16px' : '20px', padding: isMobile ? '16px' : '28px' }}>
          {filteredLeads.map(lead => <LeadCard key={lead.id} lead={lead} brokerEmail={brokerEmail} action={actions[lead.listing_id]} onActionChange={onActionChange} />)}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// PIPELINE PAGE
// ---------------------------------------------------------------------------
function PipelinePage({ leads, actions, brokerEmail, onActionChange, loading, isMobile }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest_found')
  const [search, setSearch] = useState('')

  const getStatus = (lead) => actions[lead.listing_id]?.status || 'new'
  const getFollowUpDate = (lead) => actions[lead.listing_id]?.follow_up_date || ''

  const pipelineLeads = leads
    .filter(lead => {
      const status = getStatus(lead)
      if (!['reached_out', 'follow_up', 'connected'].includes(status)) return false
      if (statusFilter !== 'all' && status !== statusFilter) return false
      if (search) {
        const s = search.toLowerCase()
        if (!lead.title?.toLowerCase().includes(s) && !lead.location?.toLowerCase().includes(s)) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'follow_up_date') return (getFollowUpDate(a) || '9999').localeCompare(getFollowUpDate(b) || '9999')
      if (sortBy === 'price_high') return (b.price || 0) - (a.price || 0)
      return new Date(b.posted_at) - new Date(a.posted_at)
    })

  const countByStatus = (s) => leads.filter(l => getStatus(l) === s).length
  const overdueCount = leads.filter(l => { const fu = getFollowUpDate(l); return fu && fu < new Date().toISOString().split('T')[0] }).length

  return (
    <div style={{ flex: 1, overflowY: 'auto', color: t.textPrimary }}>
      <div style={{ display: 'flex', gap: isMobile ? '16px' : '32px', padding: isMobile ? '16px' : '20px 28px', borderBottom: `1px solid ${t.border}`, flexWrap: 'wrap' }}>
        {[
          { label: 'Reached Out', value: countByStatus('reached_out'), color: t.success },
          { label: 'Follow Up', value: countByStatus('follow_up'), color: t.warning },
          { label: 'Connected', value: countByStatus('connected'), color: t.purple },
          { label: 'Overdue', value: overdueCount, color: t.danger },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ color: s.color, fontSize: isMobile ? '20px' : '24px', fontWeight: '700', fontFeatureSettings: '"tnum"' }}>{s.value}</span>
            <span style={{ fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '12px 16px' : '12px 28px', borderBottom: `1px solid ${t.border}`, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[{ id: 'all', label: 'All Active' }, { id: 'reached_out', label: 'Reached Out' }, { id: 'follow_up', label: 'Follow Up' }, { id: 'connected', label: 'Connected' }].map(tab => (
            <button key={tab.id} onClick={() => setStatusFilter(tab.id)}
              style={{ background: statusFilter === tab.id ? t.accent : 'transparent', color: statusFilter === tab.id ? '#fff' : t.textMuted, border: `1px solid ${statusFilter === tab.id ? t.accent : t.border}`, borderRadius: t.radiusMd, padding: '5px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: t.font }}>
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input style={{ ...filterInputStyle, width: '160px' }} type="text" placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={selectStyle} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest_found">Newest</option>
            <option value="follow_up_date">Follow Up Date</option>
            <option value="price_high">Price ↓</option>
          </select>
        </div>
      </div>
      {!isMobile && pipelineLeads.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 20px', borderBottom: `1px solid ${t.borderSubtle}` }}>
          <div style={{ width: '54px' }} />
          <div style={{ flex: 2, fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Listing</div>
          <div style={{ flex: 1, fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</div>
          <div style={{ flex: 1, fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
          <div style={{ flex: 1, fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Follow Up</div>
          <div style={{ flex: 2, fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</div>
          <div style={{ width: '20px' }} />
        </div>
      )}
      {loading ? <p style={{ color: t.textMuted, textAlign: 'center', padding: '60px' }}>Loading...</p> : pipelineLeads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <p style={{ color: t.textSecondary, fontSize: '15px', margin: '0 0 8px 0' }}>Your pipeline is empty</p>
          <p style={{ color: t.textMuted, fontSize: '13px', margin: 0 }}>Mark leads as Reached Out, Follow Up, or Connected to track them here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {pipelineLeads.map(lead => <PipelineRow key={lead.id} lead={lead} brokerEmail={brokerEmail} action={actions[lead.listing_id]} onActionChange={onActionChange} isMobile={isMobile} />)}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ANALYTICS PAGE
// ---------------------------------------------------------------------------
function AnalyticsPage({ leads, actions, isMobile }) {
  const getStatus = (lead) => actions[lead.listing_id]?.status || 'new'
  const total = leads.length
  const newCount = leads.filter(l => getStatus(l) === 'new').length
  const reachedOut = leads.filter(l => getStatus(l) === 'reached_out').length
  const followUp = leads.filter(l => getStatus(l) === 'follow_up').length
  const connected = leads.filter(l => getStatus(l) === 'connected').length
  const notInterested = leads.filter(l => getStatus(l) === 'not_interested').length
  const contactRate = total > 0 ? (((reachedOut + followUp + connected) / total) * 100).toFixed(1) : 0
  const avgPrice = leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + (l.price || 0), 0) / leads.length) : 0
  const withKeywords = leads.filter(l => l.matched_keywords?.length > 0).length
  const withPriceSignal = leads.filter(l => (l.discount_percent || 0) >= 20).length

  // Compute 7-day delta for new leads
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentLeads = leads.filter(l => new Date(l.posted_at) > sevenDaysAgo).length

  const platformData = [
    { name: 'Facebook', value: leads.filter(l => l.platform === 'facebook').length, color: t.facebook },
    { name: 'Craigslist', value: leads.filter(l => l.platform === 'craigslist').length, color: t.craigslist },
    { name: 'OfferUp', value: leads.filter(l => l.platform === 'offerup').length, color: t.offerup },
  ].filter(d => d.value > 0)

  const statusData = [
    { name: 'New', value: newCount, color: t.accent },
    { name: 'Reached Out', value: reachedOut, color: t.success },
    { name: 'Follow Up', value: followUp, color: t.warning },
    { name: 'Connected', value: connected, color: t.purple },
    { name: 'Not Interested', value: notInterested, color: t.danger },
  ].filter(d => d.value > 0)

  const chartStyle = { background: t.surface, borderRadius: t.radiusXl, padding: '20px', border: `1px solid ${t.border}` }
  const tooltipStyle = { contentStyle: { background: t.elevated, border: `1px solid ${t.border}`, borderRadius: t.radiusMd, color: t.textPrimary, fontSize: '12px' } }

  return (
    <div style={{ flex: 1, overflowY: 'auto', color: t.textPrimary }}>
      <div style={{ padding: isMobile ? '16px' : '28px' }}>
        <h2 style={{ color: t.textPrimary, fontSize: isMobile ? '18px' : '20px', margin: '0 0 20px 0', fontWeight: '700' }}>Analytics</h2>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <KpiCard label="Total Leads" value={total} delta={recentLeads} deltaLabel="this week" color={t.accent} />
          <KpiCard label="Contact Rate" value={`${contactRate}%`} delta={reachedOut + followUp + connected} deltaLabel="contacted" color={t.success} />
          <KpiCard label="Connected" value={connected} delta={connected} deltaLabel="total" color={t.purple} />
          <KpiCard label="Avg Price" value={`$${avgPrice.toLocaleString()}`} delta={0} deltaLabel="vs market" color={t.warning} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div style={chartStyle}>
            <h3 style={{ color: t.textPrimary, fontSize: '13px', fontWeight: '600', margin: '0 0 16px 0' }}>Leads by Platform</h3>
            {platformData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={platformData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {platformData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend formatter={v => <span style={{ color: t.textSecondary, fontSize: '12px' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{ color: t.textMuted, fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>No data yet</p>}
          </div>
          <div style={chartStyle}>
            <h3 style={{ color: t.textPrimary, fontSize: '13px', fontWeight: '600', margin: '0 0 16px 0' }}>Leads by Status</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend formatter={v => <span style={{ color: t.textSecondary, fontSize: '12px' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{ color: t.textMuted, fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>No data yet</p>}
          </div>
        </div>

        <div style={{ ...chartStyle, marginBottom: '16px' }}>
          <h3 style={{ color: t.textPrimary, fontSize: '13px', fontWeight: '600', margin: '0 0 16px 0' }}>Lead Signal Breakdown</h3>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { label: 'Keyword Match', value: withKeywords, color: '#fca5a5', bg: 'rgba(127,29,29,0.4)', border: 'rgba(220,38,38,0.3)' },
              { label: 'Price Signal', value: withPriceSignal, color: '#93c5fd', bg: t.accentSubtle, border: 'rgba(37,99,235,0.3)' },
              { label: 'Both Signals', value: leads.filter(l => l.matched_keywords?.length > 0 && (l.discount_percent || 0) >= 20).length, color: '#a78bfa', bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: s.bg, borderRadius: t.radiusMd, padding: '6px 14px', border: `1px solid ${s.border}` }}>
                  <span style={{ color: s.color, fontSize: '20px', fontWeight: '800', fontFeatureSettings: '"tnum"' }}>{s.value}</span>
                </div>
                <span style={{ color: t.textSecondary, fontSize: '12px' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={chartStyle}>
          <h3 style={{ color: t.textPrimary, fontSize: '13px', fontWeight: '600', margin: '0 0 16px 0' }}>Outreach Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'New Leads', value: newCount, color: t.accent },
              { label: 'Reached Out', value: reachedOut, color: t.success },
              { label: 'Follow Up', value: followUp, color: t.warning },
              { label: 'Connected', value: connected, color: t.purple },
              { label: 'Not Interested', value: notInterested, color: t.danger },
            ].map(s => (
              <div key={s.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: t.textSecondary, fontSize: '12px' }}>{s.label}</span>
                  <span style={{ color: t.textPrimary, fontSize: '12px', fontWeight: '600', fontFeatureSettings: '"tnum"' }}>{s.value}</span>
                </div>
                <div style={{ background: t.elevated, borderRadius: t.radiusFull, height: '5px', overflow: 'hidden' }}>
                  <div style={{ background: s.color, height: '100%', width: `${total > 0 ? (s.value / total) * 100 : 0}%`, borderRadius: t.radiusFull, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// DASHBOARD SHELL
// ---------------------------------------------------------------------------
function Dashboard({ user }) {
  const [leads, setLeads] = useState([])
  const [actions, setActions] = useState({})
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState('leads')
  const [search, setSearch] = useState('')
  const isMobile = useIsMobile()
  const brokerEmail = user.email

  const fetchLeads = async () => {
    const { data, error } = await supabase.from('posted_broker_leads').select('*').order('posted_at', { ascending: false })
    if (!error && data) {
      setLeads(data)
      const listingIds = data.map(l => l.listing_id)
      const actionMap = await getBrokerActions(brokerEmail, listingIds)
      setActions(actionMap)
    }
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchLeads() }, [])

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/' }
  const getStatus = (lead) => actions[lead.listing_id]?.status || 'new'

  const filteredLeads = search
    ? leads.filter(lead => {
      const s = search.toLowerCase()
      return lead.title?.toLowerCase().includes(s) || lead.location?.toLowerCase().includes(s) || lead.boat_make?.toLowerCase().includes(s)
    })
    : leads

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const counts = {
    new: leads.filter(l => getStatus(l) === 'new').length,
    reached_out: leads.filter(l => getStatus(l) === 'reached_out').length,
    follow_up: leads.filter(l => getStatus(l) === 'follow_up').length,
    connected: leads.filter(l => getStatus(l) === 'connected').length,
    not_interested: leads.filter(l => getStatus(l) === 'not_interested').length,
  }
  const deltas = {
    new: leads.filter(l => getStatus(l) === 'new' && new Date(l.posted_at) > sevenDaysAgo).length,
    reached_out: leads.filter(l => getStatus(l) === 'reached_out' && new Date(l.posted_at) > sevenDaysAgo).length,
    follow_up: leads.filter(l => getStatus(l) === 'follow_up' && new Date(l.posted_at) > sevenDaysAgo).length,
    connected: leads.filter(l => getStatus(l) === 'connected' && new Date(l.posted_at) > sevenDaysAgo).length,
    not_interested: leads.filter(l => getStatus(l) === 'not_interested' && new Date(l.posted_at) > sevenDaysAgo).length,
  }

  const statItems = [
    { label: 'New', value: counts.new, delta: deltas.new, color: t.accent },
    { label: 'Reached Out', value: counts.reached_out, delta: deltas.reached_out, color: t.success },
    { label: 'Follow Up', value: counts.follow_up, delta: deltas.follow_up, color: t.warning },
    { label: 'Connected', value: counts.connected, delta: deltas.connected, color: t.purple },
    { label: 'Not Interested', value: counts.not_interested, delta: deltas.not_interested, color: t.danger },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', background: t.bg, fontFamily: t.font, overflow: 'hidden', flexDirection: isMobile ? 'column' : 'row' }}>
      {!isMobile && <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} isMobile={false} user={user} />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, paddingBottom: isMobile ? '60px' : '0' }}>
        {/* Top bar */}
        <div style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: isMobile ? '10px 16px' : '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: isMobile ? 'auto' : '56px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 50 }}>
          {isMobile && <img src="/yachtwatch-logo.png" alt="YachtWatch" style={{ height: '28px', objectFit: 'contain' }} />}
          <input
            style={{ ...filterInputStyle, width: isMobile ? '160px' : '320px', padding: '8px 14px', fontSize: '13px', margin: isMobile ? '0' : '0 auto' }}
            type="text"
            placeholder="🔍 Search listings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <ProfileDropdown user={user} onLogout={handleLogout} />
        </div>

        {/* Stats bar */}
        <div style={{ background: t.bg, borderBottom: `1px solid ${t.border}`, padding: isMobile ? '10px 16px' : '12px 28px', display: 'flex', gap: isMobile ? '12px' : '0', overflowX: 'auto', flexShrink: 0, position: 'sticky', top: isMobile ? '49px' : '56px', zIndex: 40 }}>
          {statItems.map((s, i) => (
            <React.Fragment key={s.label}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flexShrink: 0, padding: isMobile ? '0' : '0 24px 0 0' }}>
                <span style={{ color: t.textMuted, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '500' }}>{s.label}</span>
                <span style={{ color: s.color, fontSize: isMobile ? '18px' : '22px', fontWeight: '800', fontFeatureSettings: '"tnum"', lineHeight: 1 }}>{s.value}</span>
                <span style={{ color: t.textMuted, fontSize: '10px' }}>↑{s.delta} this week</span>
              </div>
              {!isMobile && i < statItems.length - 1 && <div style={{ width: '1px', background: t.border, margin: '0 0 0 0', alignSelf: 'stretch' }} />}
            </React.Fragment>
          ))}
        </div>

        {activePage === 'leads' && <LeadsPage leads={filteredLeads} actions={actions} brokerEmail={brokerEmail} onActionChange={fetchLeads} loading={loading} isMobile={isMobile} />}
        {activePage === 'pipeline' && <PipelinePage leads={filteredLeads} actions={actions} brokerEmail={brokerEmail} onActionChange={fetchLeads} loading={loading} isMobile={isMobile} />}
        {activePage === 'analytics' && <AnalyticsPage leads={leads} actions={actions} isMobile={isMobile} />}
      </div>

      {isMobile && <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} isMobile={true} user={user} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// APP
// ---------------------------------------------------------------------------
function AppContent() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); setLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null) })
    return () => subscription.unsubscribe()
  }, [])
  if (loading) return <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: t.textPrimary }}>Loading...</p></div>
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignupPage />} />
      <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
    </Routes>
  )
}

export default function App() {
  return <BrowserRouter><AppContent /></BrowserRouter>
}

// ---------------------------------------------------------------------------
// SHARED INLINE STYLE SHORTCUTS
// ---------------------------------------------------------------------------
const inputStyle = {
  background: t.elevated, border: `1px solid ${t.border}`, borderRadius: t.radiusMd,
  padding: '10px 12px', color: t.textPrimary, fontSize: '14px', outline: 'none',
  width: '100%', boxSizing: 'border-box', fontFamily: t.font,
}
const primaryBtnStyle = {
  background: t.accent, color: '#fff', border: 'none', borderRadius: t.radiusMd,
  padding: '11px', fontSize: '14px', cursor: 'pointer', fontWeight: '600', fontFamily: t.font,
  transition: 'background 0.1s',
}
const saveBtnStyle = {
  background: t.accent, color: '#fff', border: 'none', borderRadius: t.radiusMd,
  padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: t.font, fontWeight: '600',
}
const cancelBtnStyle = {
  background: 'transparent', color: t.textMuted, border: `1px solid ${t.border}`,
  borderRadius: t.radiusMd, padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: t.font,
}
const dateInputStyle = {
  background: t.elevated, border: `1px solid ${t.border}`, borderRadius: t.radiusMd,
  padding: '5px 8px', color: t.textPrimary, fontSize: '12px', outline: 'none', fontFamily: t.font,
}
const selectStyle = {
  background: t.elevated, border: `1px solid ${t.border}`, borderRadius: t.radiusMd,
  padding: '6px 10px', color: t.textPrimary, fontSize: '12px', outline: 'none',
  cursor: 'pointer', fontFamily: t.font,
}
const filterInputStyle = {
  background: t.elevated, border: `1px solid ${t.border}`, borderRadius: t.radiusMd,
  padding: '6px 10px', color: t.textPrimary, fontSize: '12px', outline: 'none', fontFamily: t.font,
}