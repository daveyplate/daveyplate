import { ChevronDownIcon, ComputerDesktopIcon, MoonIcon, SunIcon } from "@heroicons/react/24/solid"
import { Button, cn, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react"
import { useTheme } from "next-themes"
import { useAutoTranslate } from "next-auto-translate"
import { useIsClient } from "@uidotdev/usehooks"

export default function ThemeDropdown({ isIconOnly = false, size = "md", variant = "solid" }) {
    const { setTheme, theme: currentTheme, resolvedTheme } = useTheme()
    const { autoTranslate } = useAutoTranslate("toggle_theme")
    const isClient = useIsClient()

    const themes = [
        {
            key: 'light',
            title: autoTranslate("light", "Light"),
            icon: <SunIcon className={cn("size-6", !isIconOnly && "-ms-1")} />
        },
        {
            key: 'dark',
            title: autoTranslate("dark", "Dark"),
            icon: <MoonIcon className={cn("size-5", !isIconOnly && "-ms-0.5 me-0.5")} />
        },
        {
            key: 'system',
            title: autoTranslate("system", "System"),
            icon: <ComputerDesktopIcon className={cn("size-5 mt-[1px]", !isIconOnly && "-ms-0.5 me-0.5")} />
        },
    ]

    if (!isClient) return null

    return (
        <Dropdown size={size} classNames={{ content: cn("text-lg", isIconOnly && "min-w-fit") }}>
            <DropdownTrigger>
                <Button
                    size={size}
                    variant={variant}
                    isIconOnly={isIconOnly}
                    startContent={isIconOnly ?
                        themes.find(theme => theme.key === resolvedTheme)?.icon
                        :
                        themes.find(theme => theme.key === currentTheme)?.icon
                    }
                    endContent={!isIconOnly &&
                        <ChevronDownIcon className="size-5 ms-1 -me-1 mt-0.5" />
                    }
                >
                    {!isIconOnly && themes.find(theme => theme.key === currentTheme)?.title}
                </Button>
            </DropdownTrigger>

            <DropdownMenu
                itemClasses={{
                    title: "text-base ms-1",
                    base: "ps-3 pe-4 gap-2.5",
                }}
            >
                {
                    themes.map(theme => (
                        <DropdownItem
                            key={theme.key}
                            startContent={
                                <div className="size-6 flex justify-center items-center">
                                    {theme.icon}
                                </div>
                            }
                            title={theme.title}
                            onClick={() => setTheme(theme.key)}
                        />
                    ))
                }
            </DropdownMenu>
        </Dropdown>
    )
}