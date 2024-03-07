import { getTranslationProps } from "@/lib/translation-props"
import { AutoTranslate } from "next-auto-translate"

export default function Custom404() {
    return (
        <div className="flex-container flex-center">
            <h1>
                <AutoTranslate tKey="404">
                    404 - Page Not Found
                </AutoTranslate>
            </h1>
        </div>
    )
}

export async function getStaticProps({ locale, ...context }) {
    const translationProps = await getTranslationProps({ locale, ...context })

    return { props: { ...translationProps } }
}