import { useEffect } from 'react'
import { useLocale, useRouter } from 'next-intl'
import { useSession } from '@supabase/auth-helpers-react'

import { useEntity } from '@daveyplate/supabase-swr-entities/client'

export default function useProfileLocale() {
    const session = useSession()
    const locale = useLocale()
    const router = useRouter()
    const { entity: user, updateEntity: updateUser } = useEntity(session && "profiles", session?.user.id, { lang: locale })

    useEffect(() => {
        if (!user) return
        if (!locale) return

        if (user.locale != locale) {
            updateUser({ locale })
        }
    }, [locale])

    useEffect(() => {
        if (!metadata || !metadata.locale) return

        if (user.locale !== locale) {
            router.replace(router.asPath, null, { locale: metadata.locale })
        }
    }, [user])
}