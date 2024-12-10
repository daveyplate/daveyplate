import React from "react"
import { useRouter } from "next/router"

import { AutoTranslate } from "next-auto-translate"

import { Button, Card, CardBody } from "@nextui-org/react"
import { ArrowPathIcon } from "@heroicons/react/24/solid"

import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { isExport } from "@/utils/utils"
import { GetStaticPropsContext } from "next"

export default function OfflinePage() {
    const router = useRouter()

    return (
        <div className="flex-center max-w-md">
            <h3 className="hidden sm:flex">
                <AutoTranslate tKey="title">
                    Offline
                </AutoTranslate>
            </h3>

            <Card fullWidth>
                <CardBody className="gap-4 p-4 text-center items-center">
                    <p>
                        <AutoTranslate tKey="description">
                            You are offline. Please check your internet connection and try again.
                        </AutoTranslate>
                    </p>

                    <Button
                        onPress={router.reload}
                        size="lg"
                        startContent={
                            <ArrowPathIcon className="size-5 -ms-1" />
                        }
                    >
                        <AutoTranslate tKey="reload">
                            Reload
                        </AutoTranslate>
                    </Button>
                </CardBody>
            </Card>
        </div>
    )
}

export async function getStaticProps({ locale, params }: GetStaticPropsContext) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined