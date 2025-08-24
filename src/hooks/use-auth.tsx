"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/supabase'
import { getCurrentUserProfile, createProfileIfNotExists } from '@/lib/profiles'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName?: string, role?: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signInWithFacebook: () => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (user) {
      console.log('Refreshing profile for user:', user.id)
      let { data } = await getCurrentUserProfile()
      
      // If profile doesn't exist, try to create it
      if (!data && user.email) {
        console.log('Profile not found, creating new profile...')
        const userRole = user.user_metadata?.role || 'reader'
        const fullName = user.user_metadata?.full_name || user.email.split('@')[0]
        
        const { data: newProfile, error } = await createProfileIfNotExists(
          user.id, 
          user.email, 
          fullName, 
          userRole
        )
        
        if (error) {
          console.error("Failed to create profile:", error)
        } else {
          console.log('Profile created successfully:', newProfile)
          data = newProfile
        }
      }
      
      setProfile(data)
    } else {
      setProfile(null)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('Getting initial session...')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        }
        
        console.log('Initial session:', session ? 'Found' : 'Not found')
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('User found in session:', session.user.id)
          await refreshProfile()
        } else {
          console.log('No user in session')
          setProfile(null)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'with session' : 'no session')
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('User authenticated:', session.user.id)
          await refreshProfile()
        } else {
          console.log('User signed out')
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      console.log('Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [])

  // Keep session in sync across tabs and when returning to the tab
  useEffect(() => {
    let isCleaningUp = false

    const syncSession = async (source: string) => {
      try {
        console.log(`[Auth Sync] Triggered by: ${source}`)
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('[Auth Sync] getSession error:', error)
        }

        // Only set from current snapshot; avoid forced refresh to prevent AuthSessionMissingError
        if (!isCleaningUp) {
          setUser(session?.user ?? null)
          if (session?.user) {
            await refreshProfile()
          } else {
            setProfile(null)
          }
        }
      } catch (err) {
        console.error('[Auth Sync] Unexpected error:', err)
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void syncSession('visibilitychange')
      }
    }

    const handleFocus = () => {
      void syncSession('focus')
    }

    const handleStorage = (e: StorageEvent) => {
      // Sync when our auth storage key changes across tabs
      if (e.key === 'vietnews-auth') {
        void syncSession('storage')
      }
    }

    const handlePageShow = () => {
      void syncSession('pageshow')
    }

    window.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('storage', handleStorage)
    window.addEventListener('pageshow', handlePageShow)

    return () => {
      isCleaningUp = true
      window.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [refreshProfile])

  const signIn = async (email: string, password: string) => {
    console.log('Signing in user:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('Sign in error:', error)
    } else {
      console.log('Sign in successful:', data.user?.id)
    }
    
    return { error }
  }

  const signUp = async (email: string, password: string, fullName?: string, role?: string) => {
    try {
      console.log('Signing up user with:', { email, fullName, role })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role || 'reader',
          },
        },
      })
      
      if (error) {
        console.error('SignUp error:', error)
        return { error }
      }
      
      // If signup successful, try to create profile manually if needed
      if (data.user && data.user.email) {
        console.log('User created successfully, checking profile...')
        // The trigger should handle this, but we can also try manually
        setTimeout(async () => {
          try {
            await createProfileIfNotExists(
              data.user!.id,
              data.user!.email!,
              fullName,
              role || 'reader'
            )
          } catch (profileError) {
            console.error('Manual profile creation failed:', profileError)
          }
        }, 1000)
      }
      
      return { error: null }
    } catch (error) {
      console.error('SignUp exception:', error)
      return { error }
    }
  }

  const signOut = async () => {
    console.log('Signing out user')
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error)
    } else {
      console.log('Sign out successful')
    }
    
    return { error }
  }

  const signInWithGoogle = async () => {
    console.log('Signing in with Google')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error }
  }

  const signInWithFacebook = async () => {
    console.log('Signing in with Facebook')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithFacebook,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
