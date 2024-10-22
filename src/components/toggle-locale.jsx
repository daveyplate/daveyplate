import React from "react"
import { useRouter } from 'next/router'

import { useAutoTranslate } from "next-auto-translate"

import {
    Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, Button
} from "@nextui-org/react"

import Flag from 'react-flagpack'
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

export default function ToggleLocale({ locales, locale }) {
    const router = useRouter()
    const { autoTranslate } = useAutoTranslate("footer")

    const getLocaleLink = (locale) => {
        if (!isExport()) return router.asPath

        const path = router.asPath.replace(`/${currentLocale}`, '')

        return `/${locale}${path}`
    }

    const handleLocaleChange = (locale) => {
        if (isExport()) {
            router.push(getLocaleLink(locale))
        } else {
            router.push(router.pathname, router.asPath, { locale, scroll: false })
        }
    }

    return (
        <Dropdown
            classNames={{
                content: "min-w-fit border border-default bg-gradient-to-br to-background from-default/20",
            }}
        >
            <DropdownTrigger>
                <Button variant="light" isIconOnly>
                    <Flag
                        code={localeToCountry[locale]}
                        gradient="real-linear"
                        size="m"
                        hasDropShadow
                    />
                </Button>
            </DropdownTrigger>

            <DropdownMenu
                aria-label={autoTranslate("language_menu", "Language Menu")}
                itemClasses={{
                    title: "text-base",
                    base: "px-3 gap-3",
                }}
            >
                <DropdownSection
                    title={autoTranslate("language", "Language")}
                    classNames={{ heading: "text-sm" }}
                    showDivider
                />

                {locales?.map((locale) => (
                    <DropdownItem
                        key={locale}
                        onPress={() => handleLocaleChange(locale)}
                        startContent={
                            <Flag
                                code={localeToCountry[locale]}
                                gradient="real-linear"
                                hasDropShadow
                                size="m"
                            />
                        }
                    >
                        {new Intl.DisplayNames([locale], { type: 'language' }).of(locale)}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    )
}