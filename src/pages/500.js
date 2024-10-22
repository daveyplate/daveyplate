import { AutoTranslate } from "next-auto-translate"
import { getTranslationProps } from "@/utils/translation-props"

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

export async function getStaticProps({ locale, ...context }) {
    const translationProps = await getTranslationProps({ locale, ...context })

    return { props: { ...translationProps } }
}