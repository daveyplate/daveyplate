import { GetStaticProps } from "next"

import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from "@/i18n/translation-props"
import { isExport } from "@/utils/utils"

import LoginPage from "./login"

export default LoginPage

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined