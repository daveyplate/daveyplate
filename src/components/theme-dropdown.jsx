import { ChevronDownIcon, ComputerDesktopIcon, MoonIcon, SunIcon } from "@heroicons/react/24/solid"
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react"
import { useTheme } from "next-themes"
import { useAutoTranslate } from "next-auto-translate"
import { useIsClient } from "@uidotdev/usehooks"

export default function ThemeDropdown() {
    const { setTheme, theme: currentTheme } = useTheme()
    const { autoTranslate } = useAutoTranslate("toggle_theme")
    const isClient = useIsClient()

    const themes = [
        {
            key: 'light',
            title: autoTranslate("light", "Light"),
            icon: <SunIcon className="size-6 -ms-1" />
        },
        {
            key: 'dark',
            title: autoTranslate("dark", "Dark"),
            icon: <MoonIcon className="size-5 -ms-0.5 me-0.5" />
        },
        {
            key: 'system',
            title: autoTranslate("system", "System"),
            icon: <ComputerDesktopIcon className="size-5 mt-[1px] -ms-0.5 me-0.5" />
        },
    ]

    if (!isClient) return null

    return (
        <Dropdown size="lg" classNames={{ content: "text-lg" }}>
            <DropdownTrigger>
                <Button
                    size="lg"
                    startContent={
                        themes.find(theme => theme.key === currentTheme)?.icon
                    }
                    endContent={
                        <ChevronDownIcon className="size-5 ms-1 -me-1 mt-0.5" />
                    }
                >
                    {themes.find(theme => theme.key === currentTheme)?.title}
                </Button>
            </DropdownTrigger>

            <DropdownMenu
                itemClasses={{
                    title: "text-base ms-1",
                    base: "px-3 gap-2.5",
                }}
            >
                {
                    themes.map(theme => (
                        <DropdownItem
                            key={theme.key}
                            startContent={theme.icon}
                            title={theme.title}
                            onClick={() => setTheme(theme.key)}
                        />
                    ))
                }
            </DropdownMenu>
        </Dropdown>
    )
}