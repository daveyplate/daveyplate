import { useLocale } from "next-intl"
import { useRouter } from "next/router"

import { Dropdown, DropdownItem, DropdownMenu, DropdownProps, DropdownTrigger } from "@nextui-org/react"
import Flag from "react-flagpack"

import { getPathname, usePathname } from "@/i18n/routing"
import { isExport } from "@/utils/utils"
import i18nConfig from 'i18n.config'
import { ReactNode } from "react"

export const localeToCountry: Record<string, string> = {
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
 */
export function LocaleDropdown(
    { children, ...props }: { children: ReactNode } & Omit<DropdownProps, 'children'>
) {
    const router = useRouter()
    const currentLocale = useLocale()
    const pathname = usePathname()
    const locales = i18nConfig.locales

    const handleLocaleChange = (locale: string) => {
        if (isExport()) {
            router.replace(getPathname({ href: pathname, locale }), undefined, { scroll: false })
        } else {
            router.replace(pathname, undefined, { locale, scroll: false })
        }
    }

    return (
        <Dropdown {...props}>
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