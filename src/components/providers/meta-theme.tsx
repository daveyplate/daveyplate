import { useEffect } from 'react'
import Head from 'next/head'
import { useTheme } from 'next-themes'
import { useSession } from '@supabase/auth-helpers-react'
import { useEntity } from '@daveyplate/supabase-swr-entities/client'
import { Metadata } from 'entity.types'

const lightBackground = '#FFFFFF'
const darkBackground = '#000000'

export default function MetaTheme() {
    const { resolvedTheme, theme, setTheme } = useTheme()
    const session = useSession()
    const { entity: metadata, updateEntity: updateMetadata } = useEntity<Metadata>(session && "metadata", 'me')

    useEffect(() => {
        if (!metadata) return
        if (!theme) return

        if (metadata.theme != theme) {
            updateMetadata({ theme })
        }
    }, [theme])

    useEffect(() => {
        if (!metadata) return
        if (!theme) return

        if (metadata.theme != theme) {
            setTheme(metadata.theme)
        }
    }, [metadata])

    return (
        <Head>
            <meta
                name="theme-color"
                content={resolvedTheme == 'dark' ? darkBackground : lightBackground}
            />

            <link
                rel="manifest"
                href={resolvedTheme == 'dark'
                    ? "/manifest-dark.json"
                    : "/manifest.json"
                }
            />
        </Head>
    )
}