import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from "@/i18n/translation-props"
import { isExport } from "@/utils/utils"

import LoginPage from "./login"
import { GetStaticPropsContext } from "next"

export default LoginPage

export async function getStaticProps({ locale, params }: GetStaticPropsContext) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined