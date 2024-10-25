import { AutoTranslate } from 'next-auto-translate'
import { useClearCache } from '@daveyplate/supabase-swr-entities/client'

import { Button, Card, CardBody } from "@nextui-org/react"

import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { isExport } from "@/utils/utils"

export default function Messages() {
    const clearCache = useClearCache()

    return (
        <div className="flex-container flex-center max-w-lg">
            <h2>
                <AutoTranslate tKey="title">
                    Chat
                </AutoTranslate>
            </h2>

            <Button onPress={clearCache}>
                Clear Cache
            </Button>

            <Card>
                <CardBody className="p-4">
                    <AutoTranslate tKey="description">
                        Welcome to my shoutbox, please be polite. Please be cute.
                    </AutoTranslate>

                    <div className="mt-4">
                        <AutoTranslate tKey="shout">
                            What is a shoutbox? Well, first off it's a box. And you shout into it. It's that simple.
                        </AutoTranslate>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}

export async function getStaticProps({ locale, params }) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined