import React from "react"
import { useRouter } from "next/router"

import { AutoTranslate } from "next-auto-translate"

import { getStaticPaths as getExportStaticPaths } from "@/utils/get-static"
import { getTranslationProps } from '@/utils/translation-props'
import { isExport } from "@/utils/utils"

import { Button, Card, CardBody } from "@nextui-org/react"

export default function OfflinePage() {
    const router = useRouter()

    return (
        <div className="flex-container flex-center">
            <h1>
                <AutoTranslate tKey="title">
                    Offline
                </AutoTranslate>
            </h1>

            <Card>
                <CardBody className="flex-center max-w-sm p-6 gap-4">
                    <p>
                        <AutoTranslate tKey="description">
                            You are offline. Please check your internet connection and try again.
                        </AutoTranslate>
                    </p>

                    <Button onClick={() => router.reload()} color="primary">
                        <AutoTranslate tKey="reload">
                            Reload
                        </AutoTranslate>
                    </Button>
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