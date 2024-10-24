import { useTheme } from "next-themes"
import { useAutoTranslate } from "next-auto-translate"
import { useIsClient } from "@uidotdev/usehooks"

import { Button, cn, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react"
import { ChevronDownIcon, ComputerDesktopIcon, MoonIcon, SunIcon } from "@heroicons/react/24/solid"

/**
 * Dropdown component to switch between themes
 * @param {Object} props
 * @param {Boolean} [props.isIconOnly=false] - If true, only sun & moon icon will be displayed
 * @param {("sm"|"md"|"lg")} [props.size="md"] - Size of the button
 * @param {("bordered"|"faded"|"flat"|"light"|"ghost"|"solid")} [props.variant="solid"] - Variant of the button
 * @returns {JSX.Element}
 */
export default function ThemeDropdown({ isIconOnly = false, size = "md", variant = "solid" }) {
    const { setTheme, theme: currentTheme, resolvedTheme } = useTheme()
    const { autoTranslate } = useAutoTranslate("toggle_theme")
    const isClient = useIsClient()

    const themes = [
        {
            key: 'light',
            title: autoTranslate("light", "Light"),
            icon: <SunIcon className="size-6" />
        },
        {
            key: 'dark',
            title: autoTranslate("dark", "Dark"),
            icon: <MoonIcon className="size-5" />
        },
        {
            key: 'system',
            title: autoTranslate("system", "System"),
            icon: <ComputerDesktopIcon className="size-5 mt-[1px]" />
        },
    ]

    const selectedTheme = themes.find(theme => theme.key === currentTheme)
    const selectedResolvedTheme = themes.find(theme => theme.key === resolvedTheme)

    return (
        <Dropdown
            size={size}
            classNames={{
                content: cn(
                    "transition-all",
                    isIconOnly && "min-w-fit",
                    isClient ? "opacity-1" : "opacity-0"
                )
            }}
        >
            <DropdownTrigger>
                <Button
                    size={size}
                    variant={variant}
                    isIconOnly={isIconOnly}
                    startContent={
                        <div className={cn(!isIconOnly && "flex w-6 justify-center -ms-1 -me-0.5")}>
                            {isClient && isIconOnly ? selectedResolvedTheme?.icon : selectedTheme?.icon}
                        </div>
                    }
                    endContent={!isIconOnly &&
                        <ChevronDownIcon className="size-5 mt-0.5 -me-1" />
                    }
                >
                    {isClient && !isIconOnly && selectedTheme?.title}
                </Button>
            </DropdownTrigger>

            <DropdownMenu
                itemClasses={{
                    title: "text-base",
                    base: "pe-3 gap-2.5",
                }}
            >
                {themes.map(theme => (
                    <DropdownItem
                        key={theme.key}
                        startContent={
                            <div className="flex w-6 justify-center">
                                {theme.icon}
                            </div>
                        }
                        title={theme.title}
                        onClick={() => setTheme(theme.key)}
                    />
                ))}
            </DropdownMenu>
        </Dropdown>
    )
}