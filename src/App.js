import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

// ---------------------------------------------------------------------------
// LOGIN
// ---------------------------------------------------------------------------
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginBox}>
        <h1 style={styles.loginTitle}>🚤 Boat Broker Buys</h1>
        <p style={styles.loginSubtitle}>Motivated seller leads for yacht brokers</p>
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

  return (
    <div style={{
      ...styles.card,
      borderTop: `3px solid ${statusColors[status] || '#2563eb'}`
    }}>
      {lead.image_url && (
        <img src={lead.image_url} alt={lead.title} style={styles.cardImage} />
      )}
      <div style={styles.cardBody}>
        <h3 style={styles.cardTitle}>{lead.title}</h3>

        <div style={styles.cardRow}>
          <span style={styles.price}>${lead.price?.toLocaleString()}</span>
          {lead.discount_percent && (
            <span style={styles.badge}>{lead.discount_percent}% below avg</span>
          )}
        </div>

        {/* Boat Info Checklist */}
        <div style={styles.checklist}>
          <CheckItem label="Year" value={lead.boat_year} />
          <CheckItem label="Make" value={lead.boat_make} />
          <CheckItem label="Model" value={lead.boat_model} />
          <CheckItem label="Engine Hours" value={lead.engine_hours} />
          <CheckItem label="Trailer" value={lead.has_trailer} />
        </div>

        {lead.location && <p style={styles.cardMeta}>📍 {lead.location}</p>}
        {lead.matched_keywords?.length > 0 && (
          <p style={styles.cardMeta}>🔑 {lead.matched_keywords.join(', ')}</p>
        )}
        <p style={styles.cardMeta}>🕐 {new Date(lead.posted_at).toLocaleDateString()}</p>

        <a href={lead.url} target="_blank" rel="noreferrer" style={styles.link}>
          View Listing →
        </a>

        {/* Notes */}
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
                <button onClick={() => setEditingNotes(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
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

        {/* Status Buttons */}
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
  }

  const filteredLeads = leads.filter(lead => {
    if (activeTab === 'new' && lead.status !== 'new') return false
    if (activeTab === 'contacted' && !['reached_out', 'follow_up'].includes(lead.status)) return false
    if (activeTab === 'not_interested' && lead.status !== 'not_interested') return false
    if (minPrice && lead.price < parseInt(minPrice)) return false
    if (maxPrice && lead.price > parseInt(maxPrice)) return false
    return true
  })

  const followUps = leads.filter(l => l.status === 'follow_up' && l.follow_up_date)

  return (
    <div style={styles.dashboard}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>🚤 Boat Broker Buys</h1>
        <div style={styles.headerRight}>
          <span style={styles.userEmail}>{user.email}</span>
          <button style={styles.logoutButton} onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      {/* Stats */}
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

      {/* Filters */}
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
        <div style={styles.priceFilters}>
          <input
            style={styles.filterInput}
            type="number"
            placeholder="Min price"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
          />
          <input
            style={styles.filterInput}
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <p style={styles.loading}>Loading leads...</p>
      ) : filteredLeads.length === 0 ? (
        <p style={styles.loading}>No leads in this category yet.</p>
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
export default function App() {
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

  if (loading) return <div style={styles.loginContainer}><p style={{ color: '#fff' }}>Loading...</p></div>
  return user ? <Dashboard user={user} /> : <Login />
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const styles = {
  loginContainer: {
    minHeight: '100vh',
    background: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBox: {
    background: '#1a1a1a',
    padding: '40px',
    borderRadius: '12px',
    width: '360px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    border: '1px solid #2a2a2a',
  },
  loginTitle: {
    color: '#ffffff',
    fontSize: '24px',
    margin: 0,
    textAlign: 'center',
  },
  loginSubtitle: {
    color: '#888',
    fontSize: '14px',
    margin: 0,
    textAlign: 'center',
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
  priceFilters: {
    display: 'flex',
    gap: '8px',
  },
  filterInput: {
    background: '#2a2a2a',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    padding: '8px 12px',
    color: '#ffffff',
    fontSize: '13px',
    width: '120px',
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
  badge: {
    background: '#1d4ed8',
    color: '#ffffff',
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '20px',
    fontWeight: '600',
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