import { useTheme } from "next-themes"
import { useAutoTranslate } from "next-auto-translate"

import { DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react"
import { ComputerDesktopIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline"

export default function ThemeDropdownMenu() {
    const { setTheme } = useTheme()
    const { autoTranslate } = useAutoTranslate("toggle_theme")

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

    return (
        <DropdownMenu variant="flat" className="!min-w-32">
            {themes.map(theme => (
                <DropdownItem
                    key={theme.key}
                    startContent={
                        <theme.icon className="size-4" />
                    }
                    title={theme.title}
                    onPress={() => setTheme(theme.key)}
                />
            ))}
        </DropdownMenu>
    )
}