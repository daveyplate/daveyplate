import { AutoTranslate } from 'next-auto-translate'

import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { isExport } from "@/utils/utils"
import { GetStaticPropsContext } from 'next'

export default function ErrorPage() {
    return (
        <div className="flex-center">
            <h3>
                <AutoTranslate tKey="sorry">
                    Sorry, something went wrong...
                </AutoTranslate>
            </h3>
        </div>
    )
}

export async function getStaticProps({ locale, params }: GetStaticPropsContext) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined