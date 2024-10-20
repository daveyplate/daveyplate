
import React from "react"
import { useRouter } from 'next/router'

import { motion } from "framer-motion"

import { useAutoTranslate } from "next-auto-translate"

import {
    Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, Button
} from "@nextui-org/react"

import Flag from 'react-flagpack'
import { isExport } from "@/utils/utils"

const localeToCountry = {
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

export default function Footer({ locales, locale: currentLocale }) {
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
            router.push(router.pathname, router.asPath, { locale })
        }
    }

    return (
        <footer className="backdrop-blur-xl bg-background/70 pb-safe sticky bottom-0">
            <div className="flex justify-center items-center py-2 gap-2 overflow-hidden">
                <Dropdown
                    classNames={{
                        content: "min-w-fit border border-default bg-gradient-to-br to-background from-default/20",
                    }}
                >
                    <DropdownTrigger>
                        <Button variant="light" isIconOnly>
                            <Flag
                                code={localeToCountry[currentLocale]}
                                gradient="real-linear"
                                size="m"
                                hasDropShadow
                            />
                        </Button>
                    </DropdownTrigger>

                    <DropdownMenu
                        aria-label={autoTranslate("language_menu", "Language Menu")}
                    >
                        <DropdownSection
                            title={autoTranslate("language", "Language")}
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
                                {new Intl.DisplayNames([currentLocale], { type: 'language' }).of(locale)}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>

                <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.01, 1], transition: { repeat: Infinity, duration: 2 } }}
                    style={{
                        position: 'relative',
                        display: 'inline-block',
                        filter: 'drop-shadow(0 0 8px rgba(255, 100, 0, 0.8)) drop-shadow(0 0 15px rgba(255, 150, 0, 0.6))',
                    }}
                >
                    <p className="text-foreground/80">
                        © 2024 Daveyplate
                    </p>

                    {Array.from({ length: 15 }).map((_, index) => (
                        <motion.div
                            suppressHydrationWarning
                            key={index}
                            initial={{ opacity: 0, x: Math.random() * 20 - 10, y: Math.random() * 20 - 10 }}
                            animate={{
                                opacity: [0, 1, 0],
                                x: [null, Math.random() * 100 - 50, Math.random() * 200 - 100],
                                y: [null, Math.random() * 100 - 50, Math.random() * 200 - 100],
                                scale: [1, 0.5, 0],
                                transition: { duration: Math.random() + 4, repeat: Infinity, ease: "linear" },
                            }}
                            style={{
                                position: 'fixed',
                                width: 4,
                                height: 4,
                                backgroundColor: ['red', 'orange', 'yellow'][Math.floor(Math.random() * 3)],
                                borderRadius: '50%',
                                top: '50%',
                                left: '50%',
                            }}
                        />
                    ))}
                </motion.div>
            </div>
        </footer>
    )
}