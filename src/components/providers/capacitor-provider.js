import { useEffect } from 'react'
import { useRouter } from 'next/router'
import useSWRConfig from 'swr'

import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'

import { createClient } from '@/utils/supabase/component'

export const CapacitorProvider = () => {
  const supabase = createClient()
  const router = useRouter()
  const { mutate } = useSWRConfig()

  // Listen for app state changes
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active:', isActive)
    })

    App.addListener('appUrlOpen', data => {
      console.log('appUrlOpen opened with URL:', data)

      // OAuth callback
      createSessionFromUrl(data.url)
    })

    App.addListener('appRestoredResult', data => {
      console.log('Restored state:', data)
    })

    checkAppLaunchUrl()

    return () => App.removeAllListeners()
  }, [])

  // Create a session from the URL (OAuth callback)
  const createSessionFromUrl = async (url) => {
    if (!url.includes('login-callback')) return

    // Extract the query string from the URL
    const queryString = url.split('?')[1]
    if (!queryString) {
      console.error("URL does not contain a query string")
      return
    }

    // Check the authorization code
    const params = new URLSearchParams(queryString)
    const code = params.get('code')

    if (!code) {
      console.error("Missing auth code")
      return
    }

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error(error)
      return
    }

    // Re-fetch the user into cache
    mutate("/api/profiles/me")

    const returnTo = params.get('returnTo') || '/'
    router.replace(returnTo)
  }

  const checkAppLaunchUrl = async () => {
    const { url } = await App.getLaunchUrl()
    console.log('checkAppLaunchUrl opened with URL: ' + url)
  }
}