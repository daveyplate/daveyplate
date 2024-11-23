import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Capacitor } from '@capacitor/core'
import { useTheme } from 'next-themes'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useSessionContext } from '@supabase/auth-helpers-react'
import { useIsClient } from '@uidotdev/usehooks'

import { useAutoTranslate } from 'next-auto-translate'
import { useClearCache } from '@daveyplate/supabase-swr-entities/client'

import { Card, CardBody, cn, Input } from "@nextui-org/react"

import { useLocaleRouter } from "@/i18n/routing"
import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { isExport } from "@/utils/utils"
import { createClient } from '@/utils/supabase/component'

import DefaultFont from "@/styles/fonts"

export default function Login({ view }) {
  const router = useRouter()
  const localeRouter = useLocaleRouter()
  const supabase = createClient()
  const { autoTranslate } = useAutoTranslate("login")
  const { resolvedTheme } = useTheme()
  const { session, isLoading: sessionLoading } = useSessionContext()
  const clearCache = useClearCache()
  const [redirectTo, setRedirectTo] = useState(null)
  const isClient = useIsClient()

  const defaultReturnTo = "/"

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      setRedirectTo('com.leaked.daveyplate://login-callback/?returnTo=' + (router.query.returnTo || defaultReturnTo))
    } else {
      setRedirectTo(window.location.origin + (router.query.returnTo || defaultReturnTo))
    }
  }, [])

  useEffect(() => {
    if (session) {
      clearCache()
      localeRouter.replace(router.query.returnTo || defaultReturnTo)
    }
  }, [session])

  const variables = {
    sign_up: {
      email_label: autoTranslate('sign_up_email_label', 'Email Address'),
      password_label: autoTranslate('sign_up_password_label', 'Create a Password'),
      email_input_placeholder: autoTranslate('sign_up_email_input_placeholder', 'Your email address'),
      password_input_placeholder: autoTranslate('sign_up_password_input_placeholder', 'Your password'),
      button_label: autoTranslate('sign_up_button_label', 'Sign up'),
      loading_button_label: autoTranslate('sign_up_loading_button_label', 'Signing up ...'),
      social_provider_text: autoTranslate('sign_up_social_provider_text', 'Log in with {{provider}}'),
      link_text: autoTranslate('sign_up_link_text', "Don't have an account? Sign up"),
      confirmation_text: autoTranslate('sign_up_confirmation_text', 'Check your email for the confirmation link'),
    },
    sign_in: {
      email_label: autoTranslate('sign_in_email_label', 'Email Address'),
      password_label: autoTranslate('sign_in_password_label', 'Your Password'),
      email_input_placeholder: autoTranslate('sign_in_email_input_placeholder', 'Your email address'),
      password_input_placeholder: autoTranslate('sign_in_password_input_placeholder', 'Your password'),
      button_label: autoTranslate('sign_in_button_label', 'Log in'),
      loading_button_label: autoTranslate('sign_in_loading_button_label', 'Logging in ...'),
      social_provider_text: autoTranslate('sign_in_social_provider_text', 'Log in with {{provider}}'),
      link_text: autoTranslate('sign_in_link_text', 'Already have an account? Log in'),
    },
    magic_link: {
      email_input_label: autoTranslate('magic_link_email_input_label', 'Email Address'),
      email_input_placeholder: autoTranslate('magic_link_email_input_placeholder', 'Your email address'),
      button_label: autoTranslate('magic_link_button_label', 'Log in'),
      loading_button_label: autoTranslate('magic_link_loading_button_label', 'Logging in ...'),
      link_text: autoTranslate('magic_link_link_text', 'Email me a log in link'),
      confirmation_text: autoTranslate('magic_link_confirmation_text', 'Check your email for the log in link'),
    },
    forgotten_password: {
      email_label: autoTranslate('forgotten_password_email_label', 'Email Address'),
      password_label: autoTranslate('forgotten_password_password_label', 'Your Password'),
      email_input_placeholder: autoTranslate('forgotten_password_email_input_placeholder', 'Your email address'),
      button_label: autoTranslate('forgotten_password_button_label', 'Send reset password instructions'),
      loading_button_label: autoTranslate('forgotten_password_loading_button_label', 'Sending reset instructions ...'),
      link_text: autoTranslate('forgotten_password_link_text', 'Forgot your password?'),
      confirmation_text: autoTranslate('forgotten_password_confirmation_text', 'Check your email for the password reset link'),
    },
    update_password: {
      password_label: autoTranslate('update_password_password_label', 'New Password'),
      password_input_placeholder: autoTranslate('update_password_password_input_placeholder', 'Your new password'),
      button_label: autoTranslate('update_password_button_label', 'Update password'),
      loading_button_label: autoTranslate('update_password_loading_button_label', 'Updating password ...'),
      confirmation_text: autoTranslate('update_password_confirmation_text', 'Your password has been updated'),
    },
    verify_otp: {
      email_input_label: autoTranslate('verify_otp_email_input_label', 'Email Address'),
      email_input_placeholder: autoTranslate('verify_otp_email_input_placeholder', 'Your email address'),
      phone_input_label: autoTranslate('verify_otp_phone_input_label', 'Phone number'),
      phone_input_placeholder: autoTranslate('verify_otp_phone_input_placeholder', 'Your phone number'),
      token_input_label: autoTranslate('verify_otp_token_input_label', 'Token'),
      token_input_placeholder: autoTranslate('verify_otp_token_input_placeholder', 'Your Otp token'),
      button_label: autoTranslate('verify_otp_button_label', 'Verify token'),
      loading_button_label: autoTranslate('verify_otp_loading_button_label', 'Logging in …'),
    },
  }

  return isClient && (
    <div className={cn((!session && !sessionLoading) ? "opacity-1" : "opacity-0",
      "flex-center transition-all max-w-md"
    )}>
      <Card fullWidth>
        <CardBody className="px-4 pb-0">
          <Auth
            socialLayout='horizontal'
            showLinks={true}
            view={view || 'sign_in'}
            supabaseClient={supabase}
            providers={['discord', 'google', 'facebook', 'apple']}
            redirectTo={redirectTo}
            magicLink={true}
            theme={resolvedTheme}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: `hsl(var(--nextui-primary))`,
                    brandAccent: `hsl(var(--nextui-primary))`,
                  }
                }
              },
              style: {
                label: { fontFamily: DefaultFont.style.fontFamily },
                button: { fontFamily: DefaultFont.style.fontFamily },
                input: { fontFamily: DefaultFont.style.fontFamily },
                divider: { fontFamily: DefaultFont.style.fontFamily },
                anchor: { fontFamily: DefaultFont.style.fontFamily },
              },
              className: {
                label: '!text-foreground',
                button: '!rounded-xl hover:!opacity-90',
                input: '!rounded-xl !border-2 focus:!border-foreground',
                anchor: '!text-default-500 hover:!text-default-600',
              }
            }}
            localization={{ variables }}

          >
            <Input
              label="Email Address"
              name="email"
              placeholder="Enter your email"
              type="email"
              labelPlacement="outside"
            />
          </Auth>
        </CardBody>
      </Card>

      <p className="text-center text-small text-default-400">
        By continuing, you agree to our <a href="/terms" className="underline">Terms</a> and <a href="/privacy" className="underline">Privacy</a>.
      </p>
    </div>
  )
}

export async function getStaticProps({ locale, params }) {
  const translationProps = await getTranslationProps({ locale, params })

  return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined