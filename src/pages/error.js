import { AutoTranslate } from 'next-auto-translate'

import { getStaticPaths as getExportStaticPaths } from "@/lib/get-static"
import { getTranslationProps } from '@/lib/translation-props'
import { isExport } from "@/utils/utils"

export default function ErrorPage() {
    return (
        <div className="flex-container flex-center">
            <h3>
                <AutoTranslate tKey="sorry">
                    Sorry, something went wrong...
                </AutoTranslate>
            </h3>
        </div>
    )
}

export async function getStaticProps({ locale, ...context }) {
    const translationProps = await getTranslationProps({ locale, ...context })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getExportStaticPaths : undefined