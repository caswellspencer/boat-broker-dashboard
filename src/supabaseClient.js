import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export const getSupportedCities = async () => {
  const { data, error } = await supabase
    .from('supported_cities')
    .select('*')
    .eq('active', true)
    .order('city_label')
  if (error) return []
  return data
}

export const createBrokerSubscription = async (user, city) => {
  const marketplaceUrl = `https://www.facebook.com/marketplace/${city.facebook_slug}/`
  const { error } = await supabase
    .from('broker_subscriptions')
    .insert({
      broker_name: user.full_name,
      broker_email: user.email,
      city_label: city.city_label,
      marketplace_url: marketplaceUrl,
      craigslist_region: city.craigslist_region,
      zip_code: city.zip_code,
      allowed_states: city.state,
      min_price: 50000,
      max_price: 500000,
      radius: 100,
      active: true,
    })
  return !error
}

export const getBrokerActions = async (brokerEmail, listingIds) => {
  if (!listingIds || listingIds.length === 0) return {}
  const { data } = await supabase
    .from('broker_lead_actions')
    .select('*')
    .eq('broker_email', brokerEmail)
    .in('listing_id', listingIds)
  const map = {}
  for (const row of data || []) {
    map[row.listing_id] = row
  }
  return map
}

export const upsertBrokerAction = async (brokerEmail, listingId, updates) => {
  console.log('upsertBrokerAction called:', brokerEmail, listingId, updates)
  const { data, error } = await supabase
    .from('broker_lead_actions')
    .upsert({
      broker_email: brokerEmail,
      listing_id: listingId,
      ...updates,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'broker_email,listing_id' })
  console.log('upsert result:', data, error)
  return !error
}