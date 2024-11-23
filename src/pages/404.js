import { AutoTranslate } from "next-auto-translate"
import { getTranslationProps } from "@/i18n/translation-props"

export default function Custom404() {
    return (
        <div className="flex-center">
            <h2>
                <AutoTranslate tKey="404">
                    404 - Page Not Found
                </AutoTranslate>
            </h2>
        </div>
    )
}

export async function getStaticProps({ locale, params }) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}