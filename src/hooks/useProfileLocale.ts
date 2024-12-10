import { useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useSession } from '@supabase/auth-helpers-react'

import { useEntity } from '@daveyplate/supabase-swr-entities/client'
import { useRouter } from 'next/router'
import { Profile } from 'entity.types'

export default function useProfileLocale() {
    const session = useSession()
    const locale = useLocale()
    const router = useRouter()
    const { entity: user, updateEntity: updateUser } = useEntity<Profile>(session && "profiles", session?.user.id, { lang: locale })

    useEffect(() => {
        if (!user) return
        if (!locale) return

        if (user.locale != locale) {
            updateUser({ locale })
        }
    }, [locale])

    useEffect(() => {
        if (!user || !user.locale) return

        if (user.locale !== locale) {
            router.replace(router.asPath, undefined, { locale: user.locale })
        }
    }, [user])
}