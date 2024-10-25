import { getStaticPaths as getExportStaticPaths } from "@/utils/get-static"
import { getTranslationProps } from "@/utils/translation-props"
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

export const getStaticPaths = isExport() ? getExportStaticPaths : undefined