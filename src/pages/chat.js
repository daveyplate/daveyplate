import { AutoTranslate } from 'next-auto-translate'

import { getStaticPaths as getExportStaticPaths } from "@/lib/get-static"
import { getTranslationProps } from '@/lib/translation-props'
import { isExport } from "@/utils/utils"

import { Button, Card, CardBody } from "@nextui-org/react"
import { useClear } from '@/components/cache-provider'

export default function Messages() {
    const clearCache = useClear()

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

export async function getStaticProps({ locale, ...context }) {
    const translationProps = await getTranslationProps({ locale, ...context })
    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getExportStaticPaths : undefined