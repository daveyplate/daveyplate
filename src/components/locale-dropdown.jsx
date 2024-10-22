import { ChevronDownIcon } from "@heroicons/react/24/solid"
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react"
import { useAutoTranslate } from "next-auto-translate"
import { useRouter } from "next/router"
import { isExport } from "@/utils/utils"
import Flag from "react-flagpack"
import { localeToCountry } from "./toggle-locale"

export default function LocaleDropdown({ locales, locale }) {
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
        <Dropdown size="lg" classNames={{ content: "text-lg" }}>
            <DropdownTrigger>
                <Button
                    size="lg"
                    startContent={
                        <Flag
                            className="-ms-0.5 me-0.5"
                            code={localeToCountry[locale]}
                            gradient="real-linear"
                            size="m"
                            hasDropShadow
                        />
                    }
                    endContent={
                        <ChevronDownIcon className="size-5 ms-1 -me-1 mt-0.5" />
                    }
                >
                    {new Intl.DisplayNames([locale], { type: 'language' }).of(locale)}
                </Button>
            </DropdownTrigger>

            <DropdownMenu
                itemClasses={{
                    title: "text-base ms-1",
                    base: "px-3 gap-2.5",
                }}
            >
                {
                    locales.map(locale => (
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
                            onClick={() => handleLocaleChange(locale)}
                        />
                    ))
                }

            </DropdownMenu>
        </Dropdown>
    )
}