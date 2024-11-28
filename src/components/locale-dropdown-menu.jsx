import { useRouter } from "next/router"
import { useLocale } from "next-intl"

import Flag from "react-flagpack"
import { DropdownItem, DropdownMenu } from "@nextui-org/react"

import i18nConfig from 'i18n.config'
import { getPathname, usePathname } from "@/i18n/routing"
import { isExport } from "@/utils/utils"

export const localeToCountry = {
    "en": "US",
    "de": "DE",
    "es": "ES",
    "ja": "JP",
    "zh": "CN",
    "it": "IT",
    "ko": "KR",
    "fr": "FR",
    "ru": "RU",
    "he": "IL",
    "uk": "UA",
    "hi": "IN",
    "ar": "SA",
    "tr": "TR",
    "pt": "PT",
}

/**
 * Dropdown component to switch between locales
 * @returns {JSX.Element}
 */
export default function LocaleDropdownMenu() {
    const router = useRouter()
    const currentLocale = useLocale()
    const pathname = usePathname()
    const locales = i18nConfig.i18n.locales

    const handleLocaleChange = (locale) => {
        if (isExport()) {
            router.replace(getPathname({ href: pathname, locale }), null, { scroll: false })
        } else {
            router.replace(pathname, null, { locale, scroll: false })
        }
    }

    return (
        <DropdownMenu variant="flat">
            {locales.map((locale) => (
                <DropdownItem
                    key={locale}
                    startContent={
                        <Flag
                            code={localeToCountry[locale]}
                            gradient="real-linear"
                            size="m"
                            hasDropShadow
                        />
                    }
                    title={new Intl.DisplayNames([currentLocale], { type: 'language' }).of(locale)}
                    onPress={() => handleLocaleChange(locale)}
                />
            ))}
        </DropdownMenu>
    )
}