import { useTheme } from "next-themes"
import { useAutoTranslate } from "next-auto-translate"

import { Dropdown, DropdownItem, DropdownMenu, DropdownProps, DropdownTrigger } from "@nextui-org/react"
import { ComputerDesktopIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { ReactNode } from "react"

export function ThemeDropdown(
    { children, ...props }: { children: ReactNode } & Omit<DropdownProps, "children">
) {
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
        <Dropdown {...props}>
            <DropdownTrigger>
                {children}
            </DropdownTrigger>

            <DropdownMenu variant="flat">
                {themes.map((theme) => (
                    <DropdownItem
                        key={theme.key}
                        startContent={
                            <theme.icon className="size-5" />
                        }
                        title={theme.title}
                        onPress={() => setTheme(theme.key)}
                    />
                ))}
            </DropdownMenu>
        </Dropdown>
    )
}