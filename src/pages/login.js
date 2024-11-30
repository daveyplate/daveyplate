import { useSessionContext } from "@supabase/auth-helpers-react"

import { Auth, defaultLocalization } from "@daveyplate/supabase-auth-nextui"

import { Card, CardBody, cn } from "@nextui-org/react"

import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { isExport } from "@/utils/utils"

import { createClient } from "@/utils/supabase/component"
import { getURL } from "@/utils/utils"

export default function LoginPage() {
    const supabase = createClient()
    const { session, isLoading: sessionLoading } = useSessionContext()

    const localization = defaultLocalization

    return (
        <div className={cn((session || sessionLoading) && "opacity-0",
            "flex flex-col grow items-center justify-center p-4 gap-4 transition-all"
        )}>
            <Auth
                supabaseClient={supabase}
                socialLayout="horizontal"
                providers={["github", "google", "facebook", "apple"]}
                baseUrl={getURL()}
            />

            <p className="text-center text-small text-default-400">
                By continuing, you agree to our&nbsp;

                <a href="/terms" className="underline">
                    Terms
                </a>

                &nbsp;&&nbsp;

                <a href="/privacy" className="underline">
                    Privacy
                </a>
            </p>
        </div>
    )
}

export async function getStaticProps({ locale, params }) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined