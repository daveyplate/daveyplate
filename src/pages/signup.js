import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from "@/i18n/translation-props"
import { isExport } from "@/utils/utils"

import LoginPage from "./login"

export default LoginPage

export async function getStaticProps({ locale, params }) {
    const translationProps = await getTranslationProps({ locale, params })

    return {
        props: {
            view: "sign_up",
            ...translationProps
        }
    }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined