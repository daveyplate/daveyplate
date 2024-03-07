import { getStaticPaths as getExportStaticPaths } from "@/lib/get-static"
import { getTranslationProps } from "@/lib/translation-props"
import { isExport } from "@/utils/utils"

import LoginPage from "./login"

export default LoginPage

export async function getStaticProps({ locale, ...context }) {
    const translationProps = await getTranslationProps({ locale, ...context })

    return {
        props: {
            view: "sign_up",
            ...translationProps
        }
    }
}

export const getStaticPaths = isExport() ? getExportStaticPaths : undefined