import React, { useEffect, useState, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { supabase, getSupportedCities, createBrokerSubscription, getBrokerActions, upsertBrokerAction } from './supabaseClient'

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
// ICONS
// ---------------------------------------------------------------------------
function IconLeads({ color = '#888', size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function IconPipeline({ color = '#888', size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconAnalytics({ color = '#888', size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  )
}

function IconSignOut({ color = '#555', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function IconUser({ color = '#888', size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// LANDING PAGE
// ---------------------------------------------------------------------------
function LandingPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  return (
    <div style={styles.landing}>
      <div style={{ ...styles.nav, padding: isMobile ? '16px 20px' : '20px 60px' }}>
        <img src="/yachtwatch-logo.png" alt="YachtWatch" style={{ height: isMobile ? '36px' : '48px', objectFit: 'contain' }} />
        <button style={styles.navButton} onClick={() => navigate('/login')}>Sign In</button>
      </div>

      <div style={{
        ...styles.hero,
        backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(10,10,10,1)), url(/hero-yacht.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: isMobile ? '120px 24px 60px' : '160px 60px',
      }}>
        <div style={{ ...styles.heroContent, maxWidth: isMobile ? '100%' : '720px' }}>
          <div style={styles.heroBadge}>Motivated Seller Intelligence</div>
          <h1 style={{ ...styles.heroTitle, fontSize: isMobile ? '32px' : '52px' }}>
            Find Motivated Boat Sellers<br />Before Anyone Else Does
          </h1>
          <p style={{ ...styles.heroSubtitle, fontSize: isMobile ? '15px' : '18px' }}>
            The best listings never hit the MLS. They're sitting on Facebook Marketplace and Craigslist, posted by owners who need out fast. We find them before anyone else does and put them in your inbox twice a day.
          </p>
          <div style={{ ...styles.heroButtons, flexDirection: isMobile ? 'column' : 'row' }}>
            <button style={{ ...styles.heroCta, width: isMobile ? '100%' : 'auto' }} onClick={() => navigate('/signup')}>Get Early Access</button>
            <button style={{ ...styles.heroSecondary, width: isMobile ? '100%' : 'auto' }} onClick={() => navigate('/login')}>Sign In</button>
          </div>
        </div>
      </div>

      <div style={{ ...styles.section, padding: isMobile ? '60px 24px' : '80px 60px' }}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={{ ...styles.steps, gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '32px' : '40px' }}>
          {[
            { num: '01', title: 'We Scrape', text: 'We scan Facebook Marketplace, Craigslist, and OfferUp every morning and afternoon for private sellers listing boats over $50k in your market.' },
            { num: '02', title: 'We Filter', text: 'We read every description looking for the signals you already know — moving out of state, health reasons, behind on slip fees, repo, estate sales.' },
            { num: '03', title: 'You Close', text: 'You get an email the moment a lead comes in. Open the dashboard, read the description, and reach out before anyone else knows it exists.' },
          ].map(s => (
            <div key={s.num} style={styles.step}>
              <div style={styles.stepNumber}>{s.num}</div>
              <h3 style={styles.stepTitle}>{s.title}</h3>
              <p style={styles.stepText}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...styles.valueSection, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', padding: isMobile ? '40px 24px' : '80px 60px' }}>
        {[
          { icon: '📍', title: 'Three Platforms', text: 'Facebook has the volume. Craigslist has the hidden gems. OfferUp catches what the others miss.' },
          { icon: '🚨', title: 'Motivated Seller Detection', text: "We're not just looking for boats for sale. We're looking for owners who need to sell." },
          { icon: '📧', title: 'Instant Email Alerts', text: 'The broker who calls first wins the listing. We make sure that broker is you.' },
          { icon: '📋', title: 'Built-in CRM', text: 'Track every conversation, set follow up reminders, and add notes on each seller.' },
        ].map(v => (
          <div key={v.title} style={styles.valueCard}>
            <div style={styles.valueIcon}>{v.icon}</div>
            <h3 style={styles.valueTitle}>{v.title}</h3>
            <p style={styles.valueText}>{v.text}</p>
          </div>
        ))}
      </div>

      <div style={{ ...styles.ctaSection, padding: isMobile ? '60px 24px' : '100px 60px' }}>
        <h2 style={{ ...styles.ctaTitle, fontSize: isMobile ? '28px' : '40px' }}>Built by brokers, for brokers.</h2>
        <p style={styles.ctaSubtitle}>Stop scrolling Marketplace manually. Let the leads come to you.</p>
        <button style={{ ...styles.heroCta, width: isMobile ? '100%' : 'auto' }} onClick={() => navigate('/signup')}>Get Early Access</button>
      </div>

      <div style={{ ...styles.footer, padding: isMobile ? '24px' : '32px 60px' }}>
        <img src="/yachtwatch-logo.png" alt="YachtWatch" style={{ height: '36px', objectFit: 'contain', marginBottom: '12px', opacity: 0.6 }} />
        <p style={styles.footerText}>© 2025 YachtWatch. Built for yacht brokers.</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// LOGIN
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
    <div style={styles.authContainer}>
      <div style={styles.authBox}>
        <img src="/yachtwatch-logo.png" alt="YachtWatch" style={{ height: '52px', objectFit: 'contain', margin: '0 auto', cursor: 'pointer' }} onClick={() => navigate('/')} />
        <h2 style={styles.authTitle}>Sign In</h2>
        <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} onClick={handleLogin} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        <p style={styles.authSwitch}>Don't have an account?{' '}<span style={styles.authLink} onClick={() => navigate('/signup')}>Sign up</span></p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SIGNUP
// ---------------------------------------------------------------------------
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
    <div style={styles.authContainer}>
      <div style={styles.authBox}>
        <img src="/yachtwatch-logo.png" alt="YachtWatch" style={{ height: '52px', objectFit: 'contain', margin: '0 auto' }} />
        <h2 style={styles.authTitle}>You're all set 🚤</h2>
        <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
          Welcome to YachtWatch. Your market is configured and leads will start hitting your inbox at 9am and 5pm daily. Log in to see what's already there.
        </p>
        <button style={styles.button} onClick={() => navigate('/login')}>Go to Dashboard</button>
      </div>
    </div>
  )

  return (
    <div style={styles.authContainer}>
      <div style={styles.authBox}>
        <img src="/yachtwatch-logo.png" alt="YachtWatch" style={{ height: '52px', objectFit: 'contain', margin: '0 auto', cursor: 'pointer' }} onClick={() => navigate('/')} />
        <h2 style={styles.authTitle}>Get Early Access</h2>
        <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', marginBottom: '8px' }}>Select your market and we'll start surfacing leads immediately.</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input style={{ ...styles.input, width: '50%' }} type="text" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} />
          <input style={{ ...styles.input, width: '50%' }} type="text" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>
        <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <select style={{ ...styles.input, cursor: 'pointer' }} value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
          <option value="">Select your market</option>
          {cities.map(city => <option key={city.id} value={city.id}>{city.city_label}, {city.state}</option>)}
        </select>
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} onClick={handleSignup} disabled={loading}>{loading ? 'Creating account...' : 'Request Access'}</button>
        <p style={styles.authSwitch}>Already have an account?{' '}<span style={styles.authLink} onClick={() => navigate('/login')}>Sign in</span></p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PROFILE DROPDOWN
// ---------------------------------------------------------------------------
function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: open ? '#2a2a2a' : 'transparent', border: '1px solid #2a2a2a', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <IconUser color={open ? '#fff' : '#888'} size={16} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '44px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', minWidth: '220px', zIndex: 100, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #2a2a2a' }}>
            <p style={{ color: '#fff', fontSize: '13px', fontWeight: '600', margin: '0 0 2px 0' }}>My Account</p>
            <p style={{ color: '#555', fontSize: '12px', margin: 0, wordBreak: 'break-all' }}>{user.email}</p>
          </div>
          <div style={{ padding: '6px' }}>
            <button
              onClick={() => { setOpen(false); onLogout() }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: '6px', color: '#dc2626', cursor: 'pointer', fontSize: '13px', fontFamily: "'Inter', sans-serif", textAlign: 'left' }}
            >
              <IconSignOut color="#dc2626" size={14} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SIDEBAR / BOTTOM NAV
// ---------------------------------------------------------------------------
function Sidebar({ activePage, setActivePage, onLogout, isMobile }) {
  const [hovered, setHovered] = useState(false)

  const navItems = [
    { id: 'leads', label: 'Leads', Icon: IconLeads },
    { id: 'pipeline', label: 'Pipeline', Icon: IconPipeline },
    { id: 'analytics', label: 'Analytics', Icon: IconAnalytics },
  ]

  if (isMobile) {
    return (
      <div style={styles.bottomNav}>
        {navItems.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActivePage(id)} style={{ ...styles.bottomNavItem, color: activePage === id ? '#2563eb' : '#555', borderTop: activePage === id ? '2px solid #2563eb' : '2px solid transparent' }}>
            <Icon color={activePage === id ? '#2563eb' : '#555'} size={20} />
            <span style={{ fontSize: '10px', marginTop: '2px' }}>{label}</span>
          </button>
        ))}
        <button style={{ ...styles.bottomNavItem, color: '#555', borderTop: '2px solid transparent' }} onClick={onLogout}>
          <IconSignOut color="#555" size={20} />
          <span style={{ fontSize: '10px', marginTop: '2px' }}>Out</span>
        </button>
      </div>
    )
  }

  return (
    <div
      style={{ ...styles.sidebar, width: hovered ? '180px' : '52px', transition: 'width 0.2s ease', overflow: 'hidden' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.sidebarLogoWrap}>
        <img src="/yachtwatch-logo.png" alt="YachtWatch" style={{ height: '28px', objectFit: 'contain', opacity: hovered ? 1 : 0, transition: 'opacity 0.2s ease', whiteSpace: 'nowrap' }} />
      </div>
      <nav style={styles.sidebarNav}>
        {navItems.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActivePage(id)} style={{ ...styles.sidebarItem, background: activePage === id ? '#1e3a5f' : 'transparent', color: activePage === id ? '#60a5fa' : '#888', borderLeft: activePage === id ? '3px solid #2563eb' : '3px solid transparent', justifyContent: hovered ? 'flex-start' : 'center' }}>
            <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}><Icon color={activePage === id ? '#60a5fa' : '#888'} size={17} /></span>
            {hovered && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', marginLeft: '10px' }}>{label}</span>}
          </button>
        ))}
      </nav>
      <button style={{ ...styles.sidebarLogout, justifyContent: hovered ? 'flex-start' : 'center' }} onClick={onLogout}>
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}><IconSignOut color="#555" size={15} /></span>
        {hovered && <span style={{ whiteSpace: 'nowrap', marginLeft: '8px' }}>Sign Out</span>}
      </button>
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

  const statusColors = { new: '#2563eb', reached_out: '#16a34a', not_interested: '#dc2626', follow_up: '#d97706', connected: '#7c3aed' }
  const statusLabels = { new: 'New', reached_out: 'Reached Out', not_interested: 'Not Interested', follow_up: 'Follow Up', connected: 'Connected' }
  const platformColors = { facebook: '#1d4ed8', craigslist: '#16a34a', offerup: '#d97706' }
  const platform = lead.platform || 'facebook'
  const platformColor = platformColors[platform] || '#1d4ed8'
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
    <div style={{ ...styles.card, borderTop: `3px solid ${statusColors[status] || '#2563eb'}` }}>
      <div style={{ ...styles.platformBanner, background: platformColor }}>{platformLabel}</div>
      {(hasKeywords || hasPriceSignal) && (
        <div style={styles.alertBanner}>
          {hasKeywords && <span style={styles.alertPill}>🚨 {lead.matched_keywords.join(' · ')}</span>}
          {hasPriceSignal && <span style={styles.pricePill}>📉 {lead.discount_percent}% below avg</span>}
        </div>
      )}
      {photos.length > 0 && (
        <div style={{ position: 'relative' }}>
          <img src={photos[photoIndex]} alt={lead.title} style={styles.cardImage} />
          {photos.length > 1 && (
            <>
              <button onClick={() => setPhotoIndex(i => Math.max(0, i - 1))} style={{ ...styles.photoBtn, left: '8px', opacity: photoIndex === 0 ? 0.3 : 1 }} disabled={photoIndex === 0}>‹</button>
              <button onClick={() => setPhotoIndex(i => Math.min(photos.length - 1, i + 1))} style={{ ...styles.photoBtn, right: '8px', opacity: photoIndex === photos.length - 1 ? 0.3 : 1 }} disabled={photoIndex === photos.length - 1}>›</button>
              <div style={styles.photoCounter}>{photoIndex + 1} / {photos.length}</div>
            </>
          )}
        </div>
      )}
      <div style={styles.cardBody}>
        <h3 style={styles.cardTitle}>{lead.title}</h3>
        <span style={styles.price}>${lead.price?.toLocaleString()}</span>
        <div style={styles.checklist}>
          <CheckItem label="Year" value={lead.boat_year} />
          <CheckItem label="Make" value={lead.boat_make} />
          <CheckItem label="Model" value={lead.boat_model} />
          <CheckItem label="Engine Hours" value={lead.engine_hours} />
          <CheckItem label="Trailer" value={lead.has_trailer} />
        </div>
        {lead.location && <p style={styles.cardMeta}>📍 {lead.location}</p>}
        {lead.listing_date && <p style={styles.cardMeta}>📅 Listed: {getDaysAgo(lead.listing_date)}</p>}
        <p style={styles.cardMeta}>🕐 Found: {new Date(lead.posted_at).toLocaleDateString()}</p>
        <a href={lead.url} target="_blank" rel="noreferrer" style={styles.link}>View Listing →</a>
        <div style={styles.notesSection}>
          {editingNotes ? (
            <>
              <textarea style={styles.notesInput} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes about this seller..." rows={3} />
              <div style={styles.notesButtons}>
                <button onClick={handleSaveNotes} style={styles.saveBtn} disabled={savingNotes}>{savingNotes ? 'Saving...' : 'Save'}</button>
                <button onClick={() => setEditingNotes(false)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </>
          ) : (
            <div onClick={() => setEditingNotes(true)} style={styles.notesDisplay}>
              {notes ? <p style={styles.notesText}>📝 {notes}</p> : <p style={styles.notesPlaceholder}>+ Add notes</p>}
            </div>
          )}
        </div>
        <div style={styles.statusRow}>
          {['reached_out', 'follow_up', 'connected', 'not_interested'].map(s => (
            <button key={s} onClick={() => { handleStatus(s); if (s === 'follow_up') setShowFollowUp(true) }}
              style={{ ...styles.statusBtn, background: status === s ? statusColors[s] : 'transparent', borderColor: statusColors[s], color: status === s ? '#fff' : statusColors[s] }}>
              {statusLabels[s]}
            </button>
          ))}
        </div>
        {showFollowUp && (
          <div style={styles.followUpRow}>
            <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} style={styles.dateInput} />
            <button onClick={handleFollowUp} style={styles.saveBtn}>Save</button>
          </div>
        )}
        {followUpDate && status === 'follow_up' && (
          <p style={{ ...styles.cardMeta, color: '#d97706' }}>📅 Follow up: {new Date(followUpDate).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  )
}

function CheckItem({ label, value }) {
  if (!value) return null
  return (
    <div style={styles.checkItem}>
      <span style={styles.checkLabel}>{label}:</span>
      <span style={styles.checkValue}>{value}</span>
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

  const handleStatus = async (newStatus) => {
    setStatus(newStatus)
    await upsertBrokerAction(brokerEmail, lead.listing_id, { status: newStatus })
    if (onActionChange) onActionChange()
  }
  const handleFollowUp = async () => {
    await upsertBrokerAction(brokerEmail, lead.listing_id, { follow_up_date: followUpDate })
  }
  const handleSaveNotes = async () => {
    setSavingNotes(true)
    await upsertBrokerAction(brokerEmail, lead.listing_id, { notes })
    setSavingNotes(false); setEditingNotes(false)
  }

  const statusColors = { new: '#2563eb', reached_out: '#16a34a', not_interested: '#dc2626', follow_up: '#d97706', connected: '#7c3aed' }
  const statusLabels = { new: 'New', reached_out: 'Reached Out', not_interested: 'Not Interested', follow_up: 'Follow Up', connected: 'Connected' }
  const platformColors = { facebook: '#1d4ed8', craigslist: '#16a34a', offerup: '#d97706' }
  const platform = lead.platform || 'facebook'
  const platformColor = platformColors[platform] || '#1d4ed8'
  const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1)
  const photo = lead.photos?.[0] || lead.image_url

  const getFollowUpColor = () => {
    if (!followUpDate) return '#888'
    const today = new Date().toISOString().split('T')[0]
    if (followUpDate < today) return '#dc2626'
    if (followUpDate === today) return '#d97706'
    return '#16a34a'
  }

  return (
    <>
      <div style={{ ...styles.pipelineRow, borderLeft: `3px solid ${statusColors[status] || '#2563eb'}` }} onClick={() => setExpanded(!expanded)}>
        <div style={styles.pipelinePhoto}>
          {photo
            ? <img src={photo} alt={lead.title} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px' }} />
            : <div style={{ width: '56px', height: '56px', background: '#2a2a2a', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '20px' }}>🚤</div>
          }
        </div>
        <div style={{ flex: 2, minWidth: isMobile ? '120px' : 'auto' }}>
          <p style={{ color: '#fff', fontWeight: '600', fontSize: '13px', margin: '0 0 3px 0' }}>{lead.title}</p>
          <p style={{ color: '#888', fontSize: '11px', margin: 0 }}>📍 {lead.location || 'Unknown'}</p>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#fff', fontWeight: '700', fontSize: '14px', margin: 0 }}>${lead.price?.toLocaleString()}</p>
          <div style={{ display: 'inline-block', background: platformColor, borderRadius: '4px', padding: '2px 5px', fontSize: '9px', color: '#fff', fontWeight: '700', marginTop: '3px' }}>{platformLabel}</div>
        </div>
        {!isMobile && (
          <>
            <div style={{ flex: 1 }}>
              <span style={{ background: statusColors[status], color: '#fff', borderRadius: '6px', padding: '3px 8px', fontSize: '10px', fontWeight: '700' }}>{statusLabels[status]}</span>
            </div>
            <div style={{ flex: 1 }}>
              {followUpDate
                ? <p style={{ color: getFollowUpColor(), fontSize: '11px', margin: 0, fontWeight: '600' }}>📅 {new Date(followUpDate).toLocaleDateString()}</p>
                : <p style={{ color: '#555', fontSize: '11px', margin: 0 }}>No follow up</p>
              }
            </div>
            <div style={{ flex: 2 }}>
              <p style={{ color: '#888', fontSize: '11px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{notes || '+ Add notes'}</p>
            </div>
          </>
        )}
        <div style={{ color: '#555', fontSize: '12px' }}>{expanded ? '▲' : '▼'}</div>
      </div>
      {expanded && (
        <div style={{ ...styles.pipelineExpanded, paddingLeft: isMobile ? '16px' : '100px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ width: '100%' }}>
              <p style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Status</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['reached_out', 'follow_up', 'connected', 'not_interested'].map(s => (
                  <button key={s} onClick={e => { e.stopPropagation(); handleStatus(s) }}
                    style={{ ...styles.statusBtn, background: status === s ? statusColors[s] : 'transparent', borderColor: statusColors[s], color: status === s ? '#fff' : statusColors[s] }}>
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Follow Up Date</p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} style={styles.dateInput} onClick={e => e.stopPropagation()} />
                <button onClick={e => { e.stopPropagation(); handleFollowUp() }} style={styles.saveBtn}>Save</button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <a href={lead.url} target="_blank" rel="noreferrer" style={styles.link} onClick={e => e.stopPropagation()}>View Listing →</a>
            </div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <p style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Notes</p>
            {editingNotes ? (
              <div onClick={e => e.stopPropagation()}>
                <textarea style={{ ...styles.notesInput, width: '100%' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes about this seller..." rows={3} />
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button onClick={e => { e.stopPropagation(); handleSaveNotes() }} style={styles.saveBtn} disabled={savingNotes}>{savingNotes ? 'Saving...' : 'Save'}</button>
                  <button onClick={e => { e.stopPropagation(); setEditingNotes(false) }} style={styles.cancelBtn}>Cancel</button>
                </div>
              </div>
            ) : (
              <div onClick={e => { e.stopPropagation(); setEditingNotes(true) }} style={{ ...styles.notesDisplay, width: '100%' }}>
                {notes ? <p style={styles.notesText}>📝 {notes}</p> : <p style={styles.notesPlaceholder}>+ Add notes</p>}
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
  const [platformFilter, setPlatformFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest_found')

  const getStatus = (lead) => actions[lead.listing_id]?.status || 'new'

  const filteredLeads = leads
    .filter(lead => {
      const status = getStatus(lead)
      if (activeTab === 'new' && status !== 'new') return false
      if (activeTab === 'not_interested' && status !== 'not_interested') return false
      if (minPrice && lead.price < parseInt(minPrice)) return false
      if (maxPrice && lead.price > parseInt(maxPrice)) return false
      if (platformFilter !== 'all' && lead.platform !== platformFilter) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low': return (a.price || 0) - (b.price || 0)
        case 'price_high': return (b.price || 0) - (a.price || 0)
        case 'most_discounted': return (b.discount_percent || 0) - (a.discount_percent || 0)
        case 'newest_found': return new Date(b.posted_at) - new Date(a.posted_at)
        default: return 0
      }
    })

  return (
    <div style={styles.pageContent}>
      <div style={{ ...styles.filterBar, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', padding: isMobile ? '12px 16px' : '16px 32px' }}>
        <div style={styles.tabs}>
          {[{ id: 'new', label: 'New Leads' }, { id: 'not_interested', label: 'Not Interested' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ ...styles.tab, background: activeTab === tab.id ? '#2563eb' : 'transparent', color: activeTab === tab.id ? '#fff' : '#888', padding: isMobile ? '6px 12px' : '8px 16px', fontSize: isMobile ? '12px' : '13px' }}>
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: isMobile ? '8px' : '0' }}>
          <select style={{ ...styles.filterSelect, fontSize: '12px' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest_found">Newest</option>
            <option value="price_low">Price ↑</option>
            <option value="price_high">Price ↓</option>
            <option value="most_discounted">Most Discounted</option>
          </select>
          <select style={{ ...styles.filterSelect, fontSize: '12px' }} value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="craigslist">Craigslist</option>
            <option value="offerup">OfferUp</option>
          </select>
          <input style={{ ...styles.filterInput, width: '90px' }} type="number" placeholder="Min $" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
          <input style={{ ...styles.filterInput, width: '90px' }} type="number" placeholder="Max $" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
        </div>
      </div>
      {loading ? <p style={styles.loading}>Loading leads...</p> : filteredLeads.length === 0 ? <p style={styles.loading}>No leads match your filters.</p> : (
        <div style={{ ...styles.grid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', padding: isMobile ? '16px' : '32px', gap: isMobile ? '16px' : '24px' }}>
          {filteredLeads.map(lead => (
            <LeadCard key={lead.id} lead={lead} brokerEmail={brokerEmail} action={actions[lead.listing_id]} onActionChange={onActionChange} />
          ))}
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
  const overdueCount = leads.filter(l => {
    const fu = getFollowUpDate(l)
    return fu && fu < new Date().toISOString().split('T')[0]
  }).length

  return (
    <div style={styles.pageContent}>
      <div style={{ ...styles.pipelineStats, padding: isMobile ? '16px' : '20px 32px', flexWrap: 'wrap' }}>
        {[
          { label: 'Reached Out', value: countByStatus('reached_out'), color: '#16a34a' },
          { label: 'Follow Up', value: countByStatus('follow_up'), color: '#d97706' },
          { label: 'Connected', value: countByStatus('connected'), color: '#7c3aed' },
          { label: 'Overdue', value: overdueCount, color: '#dc2626' },
        ].map(s => (
          <div key={s.label} style={styles.pipelineStat}>
            <span style={{ ...styles.pipelineStatNum, color: s.color, fontSize: isMobile ? '20px' : '24px' }}>{s.value}</span>
            <span style={styles.pipelineStatLabel}>{s.label}</span>
          </div>
        ))}
      </div>
      <div style={{ ...styles.filterBar, padding: isMobile ? '12px 16px' : '16px 32px', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center' }}>
        <div style={{ ...styles.tabs, flexWrap: 'wrap', gap: '6px' }}>
          {[{ id: 'all', label: 'All' }, { id: 'reached_out', label: 'Reached Out' }, { id: 'follow_up', label: 'Follow Up' }, { id: 'connected', label: 'Connected' }].map(tab => (
            <button key={tab.id} onClick={() => setStatusFilter(tab.id)}
              style={{ ...styles.tab, background: statusFilter === tab.id ? '#2563eb' : 'transparent', color: statusFilter === tab.id ? '#fff' : '#888', padding: '6px 12px', fontSize: '12px' }}>
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: isMobile ? '8px' : '0' }}>
          <input style={{ ...styles.filterInput, width: '160px' }} type="text" placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={styles.filterSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest_found">Newest</option>
            <option value="follow_up_date">Follow Up Date</option>
            <option value="price_high">Price ↓</option>
          </select>
        </div>
      </div>
      {!isMobile && pipelineLeads.length > 0 && (
        <div style={styles.pipelineHeader}>
          <div style={{ width: '56px' }} />
          <div style={{ flex: 2, fontSize: '11px', color: '#555', textTransform: 'uppercase' }}>Listing</div>
          <div style={{ flex: 1, fontSize: '11px', color: '#555', textTransform: 'uppercase' }}>Price</div>
          <div style={{ flex: 1, fontSize: '11px', color: '#555', textTransform: 'uppercase' }}>Status</div>
          <div style={{ flex: 1, fontSize: '11px', color: '#555', textTransform: 'uppercase' }}>Follow Up</div>
          <div style={{ flex: 2, fontSize: '11px', color: '#555', textTransform: 'uppercase' }}>Notes</div>
          <div style={{ width: '20px' }} />
        </div>
      )}
      {loading ? <p style={styles.loading}>Loading...</p> : pipelineLeads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <p style={{ color: '#888', fontSize: '15px', margin: '0 0 8px 0' }}>Your pipeline is empty</p>
          <p style={{ color: '#555', fontSize: '13px', margin: 0 }}>Mark leads as Reached Out, Follow Up, or Connected to track them here.</p>
        </div>
      ) : (
        <div style={styles.pipelineList}>
          {pipelineLeads.map(lead => (
            <PipelineRow key={lead.id} lead={lead} brokerEmail={brokerEmail} action={actions[lead.listing_id]} onActionChange={onActionChange} isMobile={isMobile} />
          ))}
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

  const facebookLeads = leads.filter(l => l.platform === 'facebook').length
  const craigslistLeads = leads.filter(l => l.platform === 'craigslist').length
  const offerupLeads = leads.filter(l => l.platform === 'offerup').length

  const platformData = [
    { name: 'Facebook', value: facebookLeads, color: '#1d4ed8' },
    { name: 'Craigslist', value: craigslistLeads, color: '#16a34a' },
    { name: 'OfferUp', value: offerupLeads, color: '#d97706' },
  ].filter(d => d.value > 0)

  const statusData = [
    { name: 'New', value: newCount, color: '#2563eb' },
    { name: 'Reached Out', value: reachedOut, color: '#16a34a' },
    { name: 'Follow Up', value: followUp, color: '#d97706' },
    { name: 'Connected', value: connected, color: '#7c3aed' },
    { name: 'Not Interested', value: notInterested, color: '#dc2626' },
  ].filter(d => d.value > 0)

  const withKeywords = leads.filter(l => l.matched_keywords?.length > 0).length
  const withPriceSignal = leads.filter(l => (l.discount_percent || 0) >= 20).length
  const avgPrice = leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + (l.price || 0), 0) / leads.length) : 0

  return (
    <div style={styles.pageContent}>
      <div style={{ padding: isMobile ? '16px' : '32px' }}>
        <h2 style={{ color: '#fff', fontSize: isMobile ? '18px' : '22px', margin: '0 0 24px 0', fontWeight: '700' }}>Analytics</h2>

        {/* Overview stats */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Leads', value: total, color: '#2563eb' },
            { label: 'Contact Rate', value: `${contactRate}%`, color: '#16a34a' },
            { label: 'Connected', value: connected, color: '#7c3aed' },
            { label: 'Avg Price', value: `$${avgPrice.toLocaleString()}`, color: '#d97706' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#1a1a1a', borderRadius: '12px', padding: isMobile ? '16px' : '20px', border: '1px solid #2a2a2a' }}>
              <p style={{ color: stat.color, fontSize: isMobile ? '22px' : '28px', fontWeight: '800', margin: '0 0 4px 0' }}>{stat.value}</p>
              <p style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>

          {/* Platform pie chart */}
          <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '20px', border: '1px solid #2a2a2a' }}>
            <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>Leads by Platform</h3>
            {platformData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={platformData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {platformData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff' }} />
                  <Legend formatter={(value) => <span style={{ color: '#888', fontSize: '12px' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#555', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>No data yet</p>
            )}
          </div>

          {/* Status pie chart */}
          <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '20px', border: '1px solid #2a2a2a' }}>
            <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>Leads by Status</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff' }} />
                  <Legend formatter={(value) => <span style={{ color: '#888', fontSize: '12px' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#555', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>No data yet</p>
            )}
          </div>
        </div>

        {/* Signal breakdown */}
        <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '20px', border: '1px solid #2a2a2a', marginBottom: '16px' }}>
          <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>Lead Signal Breakdown</h3>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {[
              { label: 'Keyword Match', value: withKeywords, color: '#fca5a5', bg: '#7f1d1d' },
              { label: 'Price Signal', value: withPriceSignal, color: '#93c5fd', bg: '#1e3a5f' },
              { label: 'Both Signals', value: leads.filter(l => l.matched_keywords?.length > 0 && (l.discount_percent || 0) >= 20).length, color: '#a78bfa', bg: '#4c1d95' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: s.bg, borderRadius: '8px', padding: '6px 12px' }}>
                  <span style={{ color: s.color, fontSize: '18px', fontWeight: '700' }}>{s.value}</span>
                </div>
                <span style={{ color: '#888', fontSize: '12px' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status detail */}
        <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '20px', border: '1px solid #2a2a2a' }}>
          <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>Outreach Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'New Leads', value: newCount, color: '#2563eb', total },
              { label: 'Reached Out', value: reachedOut, color: '#16a34a', total },
              { label: 'Follow Up', value: followUp, color: '#d97706', total },
              { label: 'Connected', value: connected, color: '#7c3aed', total },
              { label: 'Not Interested', value: notInterested, color: '#dc2626', total },
            ].map(s => (
              <div key={s.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#888', fontSize: '12px' }}>{s.label}</span>
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: '600' }}>{s.value}</span>
                </div>
                <div style={{ background: '#2a2a2a', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ background: s.color, height: '100%', width: `${total > 0 ? (s.value / total) * 100 : 0}%`, borderRadius: '4px', transition: 'width 0.5s ease' }} />
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const getStatus = (lead) => actions[lead.listing_id]?.status || 'new'
  const newCount = leads.filter(l => getStatus(l) === 'new').length
  const reachedOutCount = leads.filter(l => getStatus(l) === 'reached_out').length
  const followUpCount = leads.filter(l => getStatus(l) === 'follow_up').length
  const connectedCount = leads.filter(l => getStatus(l) === 'connected').length
  const notInterestedCount = leads.filter(l => getStatus(l) === 'not_interested').length

  const filteredLeads = search
    ? leads.filter(lead => {
      const s = search.toLowerCase()
      return lead.title?.toLowerCase().includes(s) || lead.location?.toLowerCase().includes(s) || lead.boat_make?.toLowerCase().includes(s)
    })
    : leads

  return (
    <div style={{ ...styles.dashboardShell, flexDirection: isMobile ? 'column' : 'row' }}>
      {!isMobile && <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} isMobile={false} />}

      <div style={{ ...styles.dashboardMain, paddingBottom: isMobile ? '60px' : '0' }}>
        {/* Top bar */}
        <div style={{ ...styles.topBar, padding: isMobile ? '10px 16px' : '12px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/yachtwatch-logo.png" alt="YachtWatch" style={{ height: isMobile ? '28px' : '32px', objectFit: 'contain' }} />
            <input
              style={{ ...styles.filterInput, width: isMobile ? '140px' : '220px' }}
              type="text"
              placeholder="🔍 Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <ProfileDropdown user={user} onLogout={handleLogout} />
        </div>

        {/* Stats bar */}
        <div style={{ ...styles.statsBar, padding: isMobile ? '10px 16px' : '14px 32px', gap: isMobile ? '16px' : '32px', overflowX: 'auto' }}>
          {[
            { label: 'New', value: newCount, color: '#2563eb' },
            { label: 'Reached Out', value: reachedOutCount, color: '#16a34a' },
            { label: 'Follow Up', value: followUpCount, color: '#d97706' },
            { label: 'Connected', value: connectedCount, color: '#7c3aed' },
            { label: 'Not Interested', value: notInterestedCount, color: '#dc2626' },
          ].map(s => (
            <div key={s.label} style={{ ...styles.stat, flexShrink: 0 }}>
              <span style={{ ...styles.statNumber, color: s.color, fontSize: isMobile ? '16px' : '20px' }}>{s.value}</span>
              <span style={{ ...styles.statLabel, fontSize: isMobile ? '9px' : '10px' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {activePage === 'leads' && <LeadsPage leads={filteredLeads} actions={actions} brokerEmail={brokerEmail} onActionChange={fetchLeads} loading={loading} isMobile={isMobile} />}
        {activePage === 'pipeline' && <PipelinePage leads={filteredLeads} actions={actions} brokerEmail={brokerEmail} onActionChange={fetchLeads} loading={loading} isMobile={isMobile} />}
        {activePage === 'analytics' && <AnalyticsPage leads={leads} actions={actions} isMobile={isMobile} />}
      </div>

      {isMobile && <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} isMobile={true} />}
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div style={styles.authContainer}><p style={{ color: '#fff' }}>Loading...</p></div>

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
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const styles = {
  landing: { background: '#0a0a0a', minHeight: '100vh', color: '#ffffff', fontFamily: "'Inter', sans-serif" },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1a1a1a', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  navButton: { background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', color: '#fff', padding: '8px 16px', cursor: 'pointer', fontSize: '13px' },
  hero: { display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
  heroContent: { position: 'relative', zIndex: 1 },
  heroBadge: { display: 'inline-block', background: 'rgba(37,99,235,0.2)', border: '1px solid #2563eb', color: '#60a5fa', fontSize: '11px', fontWeight: '600', padding: '4px 12px', borderRadius: '20px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' },
  heroTitle: { fontWeight: '800', lineHeight: '1.1', margin: '0 0 20px 0', color: '#ffffff' },
  heroSubtitle: { color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', margin: '0 0 32px 0' },
  heroButtons: { display: 'flex', gap: '12px', justifyContent: 'center' },
  heroCta: { background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '14px 28px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  heroSecondary: { background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', padding: '14px 28px', fontSize: '15px', cursor: 'pointer' },
  section: { borderTop: '1px solid #1a1a1a' },
  sectionTitle: { fontSize: '28px', fontWeight: '700', textAlign: 'center', margin: '0 0 48px 0' },
  steps: { display: 'grid', maxWidth: '900px', margin: '0 auto' },
  step: { textAlign: 'center' },
  stepNumber: { fontSize: '40px', fontWeight: '800', color: '#1a1a1a', marginBottom: '12px' },
  stepTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: '#ffffff' },
  stepText: { fontSize: '14px', color: '#888', lineHeight: '1.7' },
  valueSection: { display: 'grid', gap: '16px', borderTop: '1px solid #1a1a1a' },
  valueCard: { background: '#1a1a1a', borderRadius: '12px', padding: '24px', border: '1px solid #2a2a2a' },
  valueIcon: { fontSize: '28px', marginBottom: '12px' },
  valueTitle: { fontSize: '15px', fontWeight: '700', marginBottom: '10px', color: '#ffffff' },
  valueText: { fontSize: '13px', color: '#888', lineHeight: '1.7', margin: 0 },
  ctaSection: { textAlign: 'center', borderTop: '1px solid #1a1a1a' },
  ctaTitle: { fontWeight: '800', margin: '0 0 14px 0' },
  ctaSubtitle: { fontSize: '15px', color: '#888', margin: '0 0 32px 0' },
  footer: { borderTop: '1px solid #1a1a1a', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  footerText: { color: '#555', fontSize: '12px', margin: 0 },
  authContainer: { minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '20px' },
  authBox: { background: '#1a1a1a', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid #2a2a2a' },
  authTitle: { color: '#ffffff', fontSize: '20px', margin: 0, textAlign: 'center' },
  authSwitch: { color: '#888', fontSize: '13px', textAlign: 'center', margin: 0 },
  authLink: { color: '#2563eb', cursor: 'pointer' },
  input: { background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '8px', padding: '12px 14px', color: '#ffffff', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" },
  button: { background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', cursor: 'pointer', fontWeight: '600', fontFamily: "'Inter', sans-serif" },
  error: { color: '#ef4444', fontSize: '13px', margin: 0 },
  dashboardShell: { display: 'flex', minHeight: '100vh', background: '#0a0a0a', fontFamily: "'Inter', sans-serif" },
  dashboardMain: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
  topBar: { background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #2a2a2a', gap: '12px' },
  statsBar: { display: 'flex', borderBottom: '1px solid #2a2a2a', background: '#111' },
  stat: { display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 },
  statNumber: { fontWeight: '700' },
  statLabel: { color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' },
  sidebar: { background: '#111', borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', padding: '12px 0', flexShrink: 0 },
  sidebarLogoWrap: { padding: '8px 14px 20px 14px', borderBottom: '1px solid #1a1a1a', marginBottom: '8px', height: '44px', display: 'flex', alignItems: 'center' },
  sidebarNav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 6px' },
  sidebarItem: { display: 'flex', alignItems: 'center', padding: '10px', borderRadius: '6px', cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left', fontSize: '13px', fontWeight: '500', fontFamily: "'Inter', sans-serif" },
  sidebarLogout: { margin: '8px 6px 4px 6px', padding: '10px', background: 'transparent', border: '1px solid #1a1a1a', borderRadius: '6px', color: '#555', cursor: 'pointer', fontSize: '12px', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center' },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111', borderTop: '1px solid #1a1a1a', display: 'flex', zIndex: 100 },
  bottomNavItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  pageContent: { flex: 1, overflowY: 'auto', color: '#fff' },
  filterBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #2a2a2a', gap: '12px', flexWrap: 'wrap' },
  tabs: { display: 'flex', gap: '6px' },
  tab: { border: '1px solid #3a3a3a', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontFamily: "'Inter', sans-serif" },
  filterSelect: { background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '6px', padding: '7px 10px', color: '#ffffff', fontSize: '12px', outline: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  filterInput: { background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '6px', padding: '7px 10px', color: '#ffffff', fontSize: '13px', outline: 'none', fontFamily: "'Inter', sans-serif" },
  grid: { display: 'grid' },
  card: { background: '#1a1a1a', borderRadius: '12px', overflow: 'hidden', border: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column' },
  platformBanner: { padding: '4px 12px', fontSize: '10px', fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' },
  alertBanner: { background: '#111', borderBottom: '1px solid #2a2a2a', padding: '6px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px' },
  alertPill: { background: '#7f1d1d', color: '#fca5a5', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' },
  pricePill: { background: '#1e3a5f', color: '#93c5fd', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px' },
  cardImage: { width: '100%', height: '200px', objectFit: 'cover' },
  photoBtn: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', fontSize: '24px', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  photoCounter: { position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '10px' },
  cardBody: { padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' },
  cardTitle: { color: '#ffffff', fontSize: '14px', margin: 0, fontWeight: '600' },
  price: { color: '#ffffff', fontSize: '20px', fontWeight: '700' },
  checklist: { background: '#2a2a2a', borderRadius: '8px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px' },
  checkItem: { display: 'flex', gap: '8px', fontSize: '12px' },
  checkLabel: { color: '#888', minWidth: '90px' },
  checkValue: { color: '#ffffff', fontWeight: '500' },
  cardMeta: { color: '#888', fontSize: '12px', margin: 0 },
  link: { color: '#2563eb', fontSize: '13px', textDecoration: 'none', fontWeight: '600' },
  notesSection: { marginTop: '4px' },
  notesDisplay: { cursor: 'pointer', borderRadius: '6px', padding: '6px 8px', border: '1px dashed #3a3a3a' },
  notesText: { color: '#ccc', fontSize: '12px', margin: 0 },
  notesPlaceholder: { color: '#555', fontSize: '12px', margin: 0 },
  notesInput: { background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '6px', padding: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" },
  notesButtons: { display: 'flex', gap: '8px', marginTop: '6px' },
  statusRow: { display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '6px' },
  statusBtn: { border: '1px solid', borderRadius: '6px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', fontWeight: '600', fontFamily: "'Inter', sans-serif" },
  followUpRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  dateInput: { background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '6px', padding: '6px 8px', color: '#ffffff', fontSize: '12px', outline: 'none' },
  saveBtn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  cancelBtn: { background: 'transparent', color: '#888', border: '1px solid #3a3a3a', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  loading: { color: '#888', textAlign: 'center', padding: '60px' },
  pipelineStats: { display: 'flex', borderBottom: '1px solid #2a2a2a', gap: '24px' },
  pipelineStat: { display: 'flex', flexDirection: 'column', gap: '2px' },
  pipelineStatNum: { fontWeight: '700' },
  pipelineStatLabel: { fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' },
  pipelineHeader: { display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 24px', borderBottom: '1px solid #1a1a1a' },
  pipelineList: { display: 'flex', flexDirection: 'column' },
  pipelineRow: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: '1px solid #1a1a1a', cursor: 'pointer' },
  pipelinePhoto: { flexShrink: 0 },
  pipelineExpanded: { background: '#111', padding: '16px 20px 20px', borderBottom: '1px solid #1a1a1a' },
}