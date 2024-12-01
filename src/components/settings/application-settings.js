import { useLocale } from 'next-intl'
import { useTheme } from 'next-themes'

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'

import Flag from 'react-flagpack'
import { Button, CardBody, CardHeader } from "@nextui-org/react"
import { ChevronDownIcon, ComputerDesktopIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'

import { ThemeDropdown } from '@/components/theme-dropdown'
import { LocaleDropdown, localeToCountry } from '@/components/locale-dropdown'
import CellWrapper from '@/components/settings/cell-wrapper'
import { useIsHydrated } from '@/hooks/useIsHydrated'

export default function ApplicationSettings() {
    const isHydrated = useIsHydrated()
    const { theme: currentTheme } = useTheme()
    const { autoTranslate } = useAutoTranslate()
    const locale = useLocale()

    const themes = [
        {
            key: 'light',
            title: autoTranslate("light", "Light"),
            icon: SunIcon
        },
        {
            key: 'dark',
            title: autoTranslate("dark", "Dark"),
            icon: MoonIcon
        },
        {
            key: 'system',
            title: autoTranslate("system", "System"),
            icon: ComputerDesktopIcon
        },
    ]

    const selectedTheme = themes.find(theme => theme.key === currentTheme)

    return (
        <>
            <CardHeader className="px-4 py-0">
                <p className="text-large">
                    <AutoTranslate tKey="application_settings">
                        Application Settings
                    </AutoTranslate>
                </p>
            </CardHeader>

            <CardBody className="gap-3">
                <CellWrapper>
                    <p>
                        <AutoTranslate tKey="theme">
                            Theme
                        </AutoTranslate>
                    </p>

                    <ThemeDropdown className="min-w-40">
                        <Button
                            variant="bordered"
                            startContent={isHydrated && selectedTheme && (
                                <selectedTheme.icon className="size-5" />
                            )}
                            endContent={
                                <ChevronDownIcon className="size-4 mt-0.5 -me-0.5" />
                            }
                        >
                            {isHydrated && selectedTheme?.title}
                        </Button>
                    </ThemeDropdown>
                </CellWrapper>

                <CellWrapper>
                    <p>
                        <AutoTranslate tKey="language">
                            Language
                        </AutoTranslate>
                    </p>

                    <LocaleDropdown className="min-w-40">
                        <Button
                            variant="bordered"
                            startContent={
                                <Flag
                                    code={localeToCountry[locale]}
                                    gradient="real-linear"
                                    hasDropShadow
                                    size="m"
                                />
                            }
                            endContent={
                                <ChevronDownIcon className="size-4 mt-0.5 -me-0.5" />
                            }
                        >
                            {new Intl.DisplayNames([locale], { type: 'language' }).of(locale)}
                        </Button>
                    </LocaleDropdown>
                </CellWrapper>
            </CardBody>

        </>
    )
}