import { getTranslationProps } from "@/i18n/translation-props"
import { AutoTranslate } from "next-auto-translate"

export default function Custom500() {
    return (
        <div className="flex-center">
            <h2>
                <AutoTranslate tKey="500">
                    500 - Server-side error occurred
                </AutoTranslate>
            </h2>
        </div>
    )
}

export async function getStaticProps({ locale, params }) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}