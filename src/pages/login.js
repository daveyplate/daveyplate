import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useIsClient } from '@uidotdev/usehooks'
import { Capacitor } from '@capacitor/core'
import { useTheme } from 'next-themes'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useSessionContext } from '@supabase/auth-helpers-react'

import { useAutoTranslate } from 'next-auto-translate'
import { useClearCache } from '@daveyplate/supabase-swr-entities'

import { Card, CardBody, cn } from "@nextui-org/react"

import { createClient } from '@/utils/supabase/component'
import { getStaticPaths as getExportStaticPaths } from "@/utils/get-static"
import { getTranslationProps } from '@/utils/translation-props'
import { isExport } from "@/utils/utils"
import { getURL } from '@/utils/utils'

import MainFont from "@/styles/fonts"

import { localeHref } from '@/components/locale-link'

export default function Login({ view, locale }) {
    const router = useRouter()
    const isClient = useIsClient()
    const supabase = createClient()
    const { autoTranslate } = useAutoTranslate("login")
    const { resolvedTheme } = useTheme()
    const { session, isLoading: sessionLoading } = useSessionContext()
    const clearCache = useClearCache()

    const defaultReturnTo = localeHref('/', locale)

    useEffect(() => {
        if (session) {
            clearCache()
            router.replace(router.query.returnTo || defaultReturnTo)
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

    let redirectTo = getURL() + (router.query.returnTo || defaultReturnTo)

    if (Capacitor.isNativePlatform()) {
        redirectTo = 'com.leaked.daveyplate://login-callback/?returnTo=' + (router.query.returnTo || defaultReturnTo)
    }

    return (
        <div className={cn((!session && !sessionLoading) ? "opacity-1" : "opacity-0",
            "flex-center transition-all max-w-xl"
        )}>
            <Card fullWidth>
                <CardBody className="px-4 pb-0">
                    <Auth
                        socialLayout='horizontal'
                        showLinks={true}
                        view={view || 'sign_in'}
                        supabaseClient={supabase}
                        providers={['google', 'facebook', 'apple']}
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
                                label: { fontFamily: MainFont.style.fontFamily },
                                button: { fontFamily: MainFont.style.fontFamily },
                                input: { fontFamily: MainFont.style.fontFamily },
                                divider: { fontFamily: MainFont.style.fontFamily },
                                anchor: { fontFamily: MainFont.style.fontFamily },
                            },
                            className: {
                                label: '!text-foreground !text-base',
                                button: '!rounded-xl !h-12 !text-base hover:!opacity-90',
                                input: '!rounded-xl !text-base !h-12 !border-2 focus:!border-foreground',
                                anchor: '!text-small',
                            }
                        }}
                        localization={{ variables }}
                    />
                </CardBody>
            </Card>

            <p className="text-small text-center text-foreground/60 px-8 max-w-sm">
                By creating an account, you agree to our <a href="/terms" className="underline">Terms of Service</a> and <a href="/privacy" className="underline">Privacy Policy</a>.
            </p>
        </div>
    )
}

export async function getStaticProps({ locale, ...context }) {
    const translationProps = await getTranslationProps({ locale, ...context })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getExportStaticPaths : undefined