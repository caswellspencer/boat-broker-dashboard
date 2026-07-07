import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

// ---------------------------------------------------------------------------
// LANDING PAGE
// ---------------------------------------------------------------------------
function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={styles.landing}>
      {/* Nav */}
      <div style={styles.nav}>
        <span style={styles.navLogo}>🚤 YachtWatch</span>
        <button style={styles.navButton} onClick={() => navigate('/login')}>
          Sign In
        </button>
      </div>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>Motivated Seller Intelligence</div>
          <h1 style={styles.heroTitle}>
            Find Motivated Boat Sellers<br />Before Anyone Else Does
          </h1>
          <p style={styles.heroSubtitle}>
            We scrape Facebook Marketplace and Craigslist for private boat sellers showing signs of urgency — moving out of state, financial pressure, must sell fast. Surface those leads to your desk twice a day.
          </p>
          <div style={styles.heroButtons}>
            <button style={styles.heroCta} onClick={() => navigate('/signup')}>
              Get Early Access
            </button>
            <button style={styles.heroSecondary} onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.steps}>
          <div style={styles.step}>
            <div style={styles.stepNumber}>01</div>
            <h3 style={styles.stepTitle}>We Scrape</h3>
            <p style={styles.stepText}>Every morning and afternoon we scan Facebook Marketplace and Craigslist for boats listed over $50k in your market.</p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>02</div>
            <h3 style={styles.stepTitle}>We Filter</h3>
            <p style={styles.stepText}>Our system flags listings with motivated seller language — moving, must sell, financial, repo, estate sale — and pricing below market average.</p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>03</div>
            <h3 style={styles.stepTitle}>You Close</h3>
            <p style={styles.stepText}>You get an email alert the moment a lead hits. Log in to your dashboard, review the details, and reach out before the competition.</p>
          </div>
        </div>
      </div>

      {/* Value prop */}
      <div style={styles.valueSection}>
        <div style={styles.valueCard}>
          <div style={styles.valueIcon}>📍</div>
          <h3 style={styles.valueTitle}>Facebook + Craigslist</h3>
          <p style={styles.valueText}>Two platforms, one dashboard. Craigslist listings are color coded so you always know your source.</p>
        </div>
        <div style={styles.valueCard}>
          <div style={styles.valueIcon}>🚨</div>
          <h3 style={styles.valueTitle}>Motivated Seller Detection</h3>
          <p style={styles.valueText}>We read every listing description and flag the signals brokers care about — urgency, price cuts, life events.</p>
        </div>
        <div style={styles.valueCard}>
          <div style={styles.valueIcon}>📧</div>
          <h3 style={styles.valueTitle}>Instant Email Alerts</h3>
          <p style={styles.valueText}>Get notified the moment a new lead hits your market. No need to check the dashboard — we come to you.</p>
        </div>
        <div style={styles.valueCard}>
          <div style={styles.valueIcon}>📋</div>
          <h3 style={styles.valueTitle}>Built-in CRM</h3>
          <p style={styles.valueText}>Track outreach, set follow up reminders, and add notes — all inside your lead dashboard.</p>
        </div>
      </div>

      {/* CTA */}
      <div style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Find Your Next Listing?</h2>
        <p style={styles.ctaSubtitle}>Join yacht brokers already using motivated seller intelligence to grow their book of business.</p>
        <button style={styles.heroCta} onClick={() => navigate('/signup')}>
          Get Early Access
        </button>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
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
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={styles.authContainer}>
      <div style={styles.authBox}>
        <div style={styles.authLogo} onClick={() => navigate('/')}>🚤 YachtWatch</div>
        <h2 style={styles.authTitle}>Sign In</h2>
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} onClick={handleLogin} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p style={styles.authSwitch}>
          Don't have an account?{' '}
          <span style={styles.authLink} onClick={() => navigate('/signup')}>Sign up</span>
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SIGNUP
// ---------------------------------------------------------------------------
function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authBox}>
          <div style={styles.authLogo}>🚤 YachtWatch</div>
          <h2 style={styles.authTitle}>You're on the list</h2>
          <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
            We'll review your request and get you access shortly. Keep an eye on your inbox.
          </p>
          <button style={styles.button} onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.authContainer}>
      <div style={styles.authBox}>
        <div style={styles.authLogo} onClick={() => navigate('/')}>🚤 YachtWatch</div>
        <h2 style={styles.authTitle}>Get Early Access</h2>
        <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>
          We're currently onboarding brokers by market. Submit your info and we'll be in touch.
        </p>
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSignup()}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSignup()}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} onClick={handleSignup} disabled={loading}>
          {loading ? 'Submitting...' : 'Request Access'}
        </button>
        <p style={styles.authSwitch}>
          Already have an account?{' '}
          <span style={styles.authLink} onClick={() => navigate('/login')}>Sign in</span>
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// LEAD CARD
// ---------------------------------------------------------------------------
function LeadCard({ lead, onStatusChange }) {
  const [status, setStatus] = useState(lead.status || 'new')
  const [followUpDate, setFollowUpDate] = useState(lead.follow_up_date || '')
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [notes, setNotes] = useState(lead.notes || '')
  const [editingNotes, setEditingNotes] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)

  const handleStatus = async (newStatus) => {
    setStatus(newStatus)
    await supabase
      .from('posted_broker_leads')
      .update({ status: newStatus })
      .eq('id', lead.id)
    if (onStatusChange) onStatusChange()
  }

  const handleFollowUp = async () => {
    await supabase
      .from('posted_broker_leads')
      .update({ follow_up_date: followUpDate })
      .eq('id', lead.id)
    setShowFollowUp(false)
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    await supabase
      .from('posted_broker_leads')
      .update({ notes })
      .eq('id', lead.id)
    setSavingNotes(false)
    setEditingNotes(false)
  }

  const statusColors = {
    new: '#2563eb',
    reached_out: '#16a34a',
    not_interested: '#dc2626',
    follow_up: '#d97706',
  }

  const statusLabels = {
    new: 'New',
    reached_out: 'Reached Out',
    not_interested: 'Not Interested',
    follow_up: 'Follow Up',
  }

  const platformColors = {
    facebook: '#1d4ed8',
    craigslist: '#16a34a',
    offerup: '#d97706',
  }

  const platform = lead.platform || 'facebook'
  const platformColor = platformColors[platform] || '#1d4ed8'
  const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1)
  const hasKeywords = lead.matched_keywords?.length > 0
  const hasPriceSignal = lead.discount_percent >= 20

  const getDaysAgo = (dateStr) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today'
    if (diff === 1) return '1 day ago'
    return `${diff} days ago`
  }

  return (
    <div style={{ ...styles.card, borderTop: `3px solid ${statusColors[status] || '#2563eb'}` }}>
      <div style={{ ...styles.platformBanner, background: platformColor }}>
        {platformLabel}
      </div>

      {(hasKeywords || hasPriceSignal) && (
        <div style={styles.alertBanner}>
          {hasKeywords && (
            <span style={styles.alertPill}>🚨 {lead.matched_keywords.join(' · ')}</span>
          )}
          {hasPriceSignal && (
            <span style={styles.pricePill}>📉 {lead.discount_percent}% below avg</span>
          )}
        </div>
      )}

      {lead.image_url && (
        <img src={lead.image_url} alt={lead.title} style={styles.cardImage} />
      )}
      <div style={styles.cardBody}>
        <h3 style={styles.cardTitle}>{lead.title}</h3>
        <div style={styles.cardRow}>
          <span style={styles.price}>${lead.price?.toLocaleString()}</span>
        </div>

        <div style={styles.checklist}>
          <CheckItem label="Year" value={lead.boat_year} />
          <CheckItem label="Make" value={lead.boat_make} />
          <CheckItem label="Model" value={lead.boat_model} />
          <CheckItem label="Engine Hours" value={lead.engine_hours} />
          <CheckItem label="Trailer" value={lead.has_trailer} />
        </div>

        {lead.location && <p style={styles.cardMeta}>📍 {lead.location}</p>}
        {lead.listing_date && (
          <p style={styles.cardMeta}>📅 Listed: {getDaysAgo(lead.listing_date)}</p>
        )}
        <p style={styles.cardMeta}>🕐 Found: {new Date(lead.posted_at).toLocaleDateString()}</p>

        <a href={lead.url} target="_blank" rel="noreferrer" style={styles.link}>
          View Listing →
        </a>

        <div style={styles.notesSection}>
          {editingNotes ? (
            <>
              <textarea
                style={styles.notesInput}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add notes about this seller..."
                rows={3}
              />
              <div style={styles.notesButtons}>
                <button onClick={handleSaveNotes} style={styles.saveBtn} disabled={savingNotes}>
                  {savingNotes ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditingNotes(false)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </>
          ) : (
            <div onClick={() => setEditingNotes(true)} style={styles.notesDisplay}>
              {notes ? (
                <p style={styles.notesText}>📝 {notes}</p>
              ) : (
                <p style={styles.notesPlaceholder}>+ Add notes</p>
              )}
            </div>
          )}
        </div>

        <div style={styles.statusRow}>
          {['reached_out', 'follow_up', 'not_interested'].map(s => (
            <button
              key={s}
              onClick={() => {
                handleStatus(s)
                if (s === 'follow_up') setShowFollowUp(true)
              }}
              style={{
                ...styles.statusBtn,
                background: status === s ? statusColors[s] : 'transparent',
                borderColor: statusColors[s],
                color: status === s ? '#fff' : statusColors[s],
              }}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>

        {showFollowUp && (
          <div style={styles.followUpRow}>
            <input
              type="date"
              value={followUpDate}
              onChange={e => setFollowUpDate(e.target.value)}
              style={styles.dateInput}
            />
            <button onClick={handleFollowUp} style={styles.saveBtn}>Save</button>
          </div>
        )}

        {lead.follow_up_date && status === 'follow_up' && (
          <p style={{ ...styles.cardMeta, color: '#d97706' }}>
            📅 Follow up: {new Date(lead.follow_up_date).toLocaleDateString()}
          </p>
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
// DASHBOARD
// ---------------------------------------------------------------------------
function Dashboard({ user }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('new')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [minYear, setMinYear] = useState('')
  const [maxYear, setMaxYear] = useState('')
  const [maxDaysAgo, setMaxDaysAgo] = useState('')

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('posted_broker_leads')
      .select('*')
      .order('posted_at', { ascending: false })
    if (!error) setLeads(data)
    setLoading(false)
  }

  useEffect(() => { fetchLeads() }, [])

    const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const filteredLeads = leads.filter(lead => {
    if (activeTab === 'new' && lead.status !== 'new') return false
    if (activeTab === 'contacted' && !['reached_out', 'follow_up'].includes(lead.status)) return false
    if (activeTab === 'not_interested' && lead.status !== 'not_interested') return false
    if (minPrice && lead.price < parseInt(minPrice)) return false
    if (maxPrice && lead.price > parseInt(maxPrice)) return false
    if (platformFilter !== 'all' && lead.platform !== platformFilter) return false
    if (minYear && lead.boat_year && parseInt(lead.boat_year) < parseInt(minYear)) return false
    if (maxYear && lead.boat_year && parseInt(lead.boat_year) > parseInt(maxYear)) return false
    if (maxDaysAgo && lead.listing_date) {
      const days = Math.floor((new Date() - new Date(lead.listing_date)) / (1000 * 60 * 60 * 24))
      if (days > parseInt(maxDaysAgo)) return false
    }
    return true
  })

  const followUps = leads.filter(l => l.status === 'follow_up' && l.follow_up_date)

  return (
    <div style={styles.dashboard}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>🚤 YachtWatch</h1>
        <div style={styles.headerRight}>
          <span style={styles.userEmail}>{user.email}</span>
          <button style={styles.logoutButton} onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={styles.statNumber}>{leads.filter(l => l.status === 'new').length}</span>
          <span style={styles.statLabel}>New Leads</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>{leads.filter(l => l.status === 'reached_out').length}</span>
          <span style={styles.statLabel}>Reached Out</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>{followUps.length}</span>
          <span style={styles.statLabel}>Follow Ups</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>{leads.filter(l => l.status === 'not_interested').length}</span>
          <span style={styles.statLabel}>Not Interested</span>
        </div>
      </div>

      <div style={styles.filterBar}>
        <div style={styles.tabs}>
          {['new', 'contacted', 'not_interested'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tab,
                background: activeTab === tab ? '#2563eb' : 'transparent',
                color: activeTab === tab ? '#fff' : '#888',
              }}
            >
              {tab === 'new' ? 'New Leads' : tab === 'contacted' ? 'Contacted' : 'Not Interested'}
            </button>
          ))}
        </div>
        <div style={styles.filtersRight}>
          <select style={styles.filterSelect} value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="craigslist">Craigslist</option>
            <option value="offerup">OfferUp</option>
          </select>
          <input style={styles.filterInput} type="number" placeholder="Min price" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
          <input style={styles.filterInput} type="number" placeholder="Max price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          <input style={styles.filterInput} type="number" placeholder="Min year" value={minYear} onChange={e => setMinYear(e.target.value)} />
          <input style={styles.filterInput} type="number" placeholder="Max year" value={maxYear} onChange={e => setMaxYear(e.target.value)} />
          <select style={styles.filterSelect} value={maxDaysAgo} onChange={e => setMaxDaysAgo(e.target.value)}>
            <option value="">Any age</option>
            <option value="1">Today</option>
            <option value="3">Last 3 days</option>
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p style={styles.loading}>Loading leads...</p>
      ) : filteredLeads.length === 0 ? (
        <p style={styles.loading}>No leads match your filters.</p>
      ) : (
        <div style={styles.grid}>
          {filteredLeads.map(lead => (
            <LeadCard key={lead.id} lead={lead} onStatusChange={fetchLeads} />
          ))}
        </div>
      )}
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
  // Landing
  landing: {
    background: '#0a0a0a',
    minHeight: '100vh',
    color: '#ffffff',
    fontFamily: 'sans-serif',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 60px',
    borderBottom: '1px solid #1a1a1a',
  },
  navLogo: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
  },
  navButton: {
    background: 'transparent',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    color: '#888',
    padding: '8px 20px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 60px',
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: '720px',
  },
  heroBadge: {
    display: 'inline-block',
    background: '#1a1a1a',
    border: '1px solid #2563eb',
    color: '#2563eb',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 14px',
    borderRadius: '20px',
    marginBottom: '24px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  heroTitle: {
    fontSize: '52px',
    fontWeight: '800',
    lineHeight: '1.1',
    margin: '0 0 24px 0',
    color: '#ffffff',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: '#888',
    lineHeight: '1.7',
    margin: '0 0 40px 0',
  },
  heroButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  heroCta: {
    background: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  heroSecondary: {
    background: 'transparent',
    color: '#888',
    border: '1px solid #3a3a3a',
    borderRadius: '8px',
    padding: '14px 32px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  section: {
    padding: '80px 60px',
    borderTop: '1px solid #1a1a1a',
  },
  sectionTitle: {
    fontSize: '32px',
    fontWeight: '700',
    textAlign: 'center',
    margin: '0 0 60px 0',
  },
  steps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '40px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  step: {
    textAlign: 'center',
  },
  stepNumber: {
    fontSize: '48px',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '16px',
  },
  stepTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#ffffff',
  },
  stepText: {
    fontSize: '14px',
    color: '#888',
    lineHeight: '1.7',
  },
  valueSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
    padding: '80px 60px',
    borderTop: '1px solid #1a1a1a',
  },
  valueCard: {
    background: '#1a1a1a',
    borderRadius: '12px',
    padding: '32px 24px',
    border: '1px solid #2a2a2a',
  },
  valueIcon: {
    fontSize: '32px',
    marginBottom: '16px',
  },
  valueTitle: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#ffffff',
  },
  valueText: {
    fontSize: '14px',
    color: '#888',
    lineHeight: '1.7',
    margin: 0,
  },
  ctaSection: {
    textAlign: 'center',
    padding: '100px 60px',
    borderTop: '1px solid #1a1a1a',
  },
  ctaTitle: {
    fontSize: '40px',
    fontWeight: '800',
    margin: '0 0 16px 0',
  },
  ctaSubtitle: {
    fontSize: '16px',
    color: '#888',
    margin: '0 0 40px 0',
  },
  footer: {
    padding: '32px 60px',
    borderTop: '1px solid #1a1a1a',
    textAlign: 'center',
  },
  footerText: {
    color: '#555',
    fontSize: '13px',
    margin: 0,
  },
  // Auth
  authContainer: {
    minHeight: '100vh',
    background: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authBox: {
    background: '#1a1a1a',
    padding: '40px',
    borderRadius: '12px',
    width: '360px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    border: '1px solid #2a2a2a',
  },
  authLogo: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    cursor: 'pointer',
  },
  authTitle: {
    color: '#ffffff',
    fontSize: '22px',
    margin: 0,
    textAlign: 'center',
  },
  authSwitch: {
    color: '#888',
    fontSize: '13px',
    textAlign: 'center',
    margin: 0,
  },
  authLink: {
    color: '#2563eb',
    cursor: 'pointer',
  },
  input: {
    background: '#2a2a2a',
    border: '1px solid #3a3a3a',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  button: {
    background: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  error: {
    color: '#ef4444',
    fontSize: '13px',
    margin: 0,
  },
  // Dashboard
  dashboard: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#ffffff',
  },
  header: {
    background: '#1a1a1a',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #2a2a2a',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: '20px',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userEmail: {
    color: '#888',
    fontSize: '14px',
  },
  logoutButton: {
    background: 'transparent',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    color: '#888',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  statsBar: {
    display: 'flex',
    gap: '32px',
    padding: '24px 32px',
    borderBottom: '1px solid #2a2a2a',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: '12px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 32px',
    borderBottom: '1px solid #2a2a2a',
    gap: '16px',
    flexWrap: 'wrap',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
  },
  tab: {
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  filtersRight: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterSelect: {
    background: '#2a2a2a',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    padding: '8px 12px',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
  },
  filterInput: {
    background: '#2a2a2a',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    padding: '8px 12px',
    color: '#ffffff',
    fontSize: '13px',
    width: '100px',
    outline: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    padding: '32px',
  },
  card: {
    background: '#1a1a1a',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #2a2a2a',
    display: 'flex',
    flexDirection: 'column',
  },
  platformBanner: {
    padding: '4px 12px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  alertBanner: {
    background: '#111',
    borderBottom: '1px solid #2a2a2a',
    padding: '8px 12px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  alertPill: {
    background: '#7f1d1d',
    color: '#fca5a5',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  pricePill: {
    background: '#1e3a5f',
    color: '#93c5fd',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  cardImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  cardBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: '15px',
    margin: 0,
    fontWeight: '600',
  },
  cardRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  price: {
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: '700',
  },
  checklist: {
    background: '#2a2a2a',
    borderRadius: '8px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  checkItem: {
    display: 'flex',
    gap: '8px',
    fontSize: '13px',
  },
  checkLabel: {
    color: '#888',
    minWidth: '100px',
  },
  checkValue: {
    color: '#ffffff',
    fontWeight: '500',
  },
  cardMeta: {
    color: '#888',
    fontSize: '13px',
    margin: 0,
  },
  link: {
    color: '#2563eb',
    fontSize: '13px',
    textDecoration: 'none',
    fontWeight: '600',
    marginTop: '4px',
  },
  notesSection: {
    marginTop: '4px',
  },
  notesDisplay: {
    cursor: 'pointer',
    borderRadius: '6px',
    padding: '6px 8px',
    border: '1px dashed #3a3a3a',
  },
  notesText: {
    color: '#ccc',
    fontSize: '13px',
    margin: 0,
  },
  notesPlaceholder: {
    color: '#555',
    fontSize: '13px',
    margin: 0,
  },
  notesInput: {
    width: '100%',
    background: '#2a2a2a',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    padding: '8px',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  notesButtons: {
    display: 'flex',
    gap: '8px',
    marginTop: '6px',
  },
  statusRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '8px',
  },
  statusBtn: {
    border: '1px solid',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  followUpRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  dateInput: {
    background: '#2a2a2a',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    padding: '6px 10px',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
  },
  saveBtn: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  cancelBtn: {
    background: 'transparent',
    color: '#888',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  loading: {
    color: '#888',
    textAlign: 'center',
    padding: '60px',
  },
}