import { useRouter } from "next/router"

import Flag from "react-flagpack"
import { Button, cn, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react"
import { ChevronDownIcon } from "@heroicons/react/24/solid"

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
 * @param {Object} props
 * @param {Array} props.locales - Array of locales
 * @param {String} props.locale - Current locale
 * @param {Boolean} [props.isIconOnly=false] - If true, only flag icon will be displayed
 * @param {("sm"|"md"|"lg")} [props.size="md"] - Size of the button
 * @param {("bordered"|"faded"|"flat"|"light"|"ghost"|"solid")} [props.variant="solid"] - Variant of the button
 * @returns {JSX.Element}
 */
export default function LocaleDropdown({ locales, locale, isIconOnly = false, size = "md", variant = "solid" }) {
    const router = useRouter()

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
        <Dropdown size={size} classNames={{ content: cn("text-lg", isIconOnly && "min-w-fit") }}>
            <DropdownTrigger>
                <Button
                    isIconOnly={isIconOnly}
                    size={size}
                    variant={variant}
                    startContent={
                        <Flag
                            className={cn(!isIconOnly && "-ms-0.5 me-1")}
                            code={localeToCountry[locale]}
                            gradient="real-linear"
                            size="m"
                            hasDropShadow
                        />
                    }
                    endContent={!isIconOnly &&
                        <ChevronDownIcon className="size-5 ms-1 -me-1 mt-0.5" />
                    }
                >
                    {!isIconOnly && new Intl.DisplayNames([locale], { type: 'language' }).of(locale)}
                </Button>
            </DropdownTrigger>

            <DropdownMenu
                itemClasses={{
                    title: "text-base ms-1",
                    base: "px-3 gap-3",
                }}
            >
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
                        title={new Intl.DisplayNames([locale], { type: 'language' }).of(locale)}
                        onPress={() => handleLocaleChange(locale)}
                    />
                ))}
            </DropdownMenu>
        </Dropdown>
    )
}