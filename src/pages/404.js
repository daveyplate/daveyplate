import { AutoTranslate } from "next-auto-translate"
import { getTranslationProps } from "@/utils/translation-props"

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

export async function getStaticProps({ locale, ...context }) {
    const translationProps = await getTranslationProps({ locale, ...context })

    return { props: { ...translationProps } }
}