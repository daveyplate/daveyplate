import { useLocale } from "next-intl"
import { useRouter } from "next/router"

import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react"
import Flag from "react-flagpack"

import { getPathname, usePathname } from "@/i18n/routing"
import { isExport } from "@/utils/utils"
import i18nConfig from 'i18n.config'

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
export function LocaleDropdown({ children, ...props }) {
    const router = useRouter()
    const currentLocale = useLocale()
    const pathname = usePathname()
    const locales = i18nConfig.locales

    const handleLocaleChange = (locale) => {
        if (isExport()) {
            router.replace(getPathname({ href: pathname, locale }), null, { scroll: false })
        } else {
            router.replace(pathname, null, { locale, scroll: false })
        }
    }

    return (
        <Dropdown placement="auto" {...props}>
            <DropdownTrigger>
                {children}
            </DropdownTrigger>

            <DropdownMenu variant="flat">
                {locales?.map((locale) => (
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
        </Dropdown>
    )
}