import { supabase } from './supabase'
import { Profile } from './supabase'

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: new Error('Not authenticated') }
  
  return getProfile(user.id)
}

export async function createProfileIfNotExists(userId: string, email: string, fullName?: string, role: string = 'reader') {
  console.log('Creating profile for user:', { userId, email, fullName, role })
  
  // First check if profile exists
  const { data: existingProfile, error: checkError } = await getProfile(userId)
  
  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking existing profile:', checkError)
  }
  
  if (existingProfile) {
    console.log('Profile already exists:', existingProfile)
    return { data: existingProfile, error: null }
  }
  
  // Create profile if it doesn't exist
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      id: userId,
      email: email,
      full_name: fullName || email.split('@')[0],
      role: role,
    }])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating profile:', error)
    return { data: null, error }
  }
  
  console.log('Profile created successfully:', data)
  return { data, error: null }
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

export async function updateCurrentUserProfile(updates: Partial<Profile>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: new Error('Not authenticated') }
  
  return updateProfile(user.id, updates)
}

export async function getAllProfiles(limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  return { data, error }
}

export async function getProfilesByRole(role: string, limit = 50) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  return { data, error }
}

export async function searchProfiles(query: string, limit = 20) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  return { data, error }
}

export async function updateUserRole(userId: string, role: 'reader' | 'writer' | 'editor' | 'admin') {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

export async function deactivateProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

export async function activateProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: true })
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

export async function verifyProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_verified: true })
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

export async function getUserStats(userId: string) {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}
