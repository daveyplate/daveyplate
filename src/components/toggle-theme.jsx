import React, { forwardRef } from 'react'
import { useTheme } from "next-themes"

import { AutoTranslate, useAutoTranslate } from "next-auto-translate"

import { MoonIcon, SunIcon, ComputerDesktopIcon } from '@heroicons/react/24/solid'

import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react"

const ToggleTheme = forwardRef((props, ref) => {
    const { autoTranslate } = useAutoTranslate("toggle_theme")
    const { setTheme } = useTheme()

    return (
        <Dropdown
            {...props}
            ref={ref}
            classNames={{
                content: "min-w-fit border border-default bg-gradient-to-br to-background from-default/20",
            }}
        >
            <DropdownTrigger>
                <Button isIconOnly variant="light">
                    <SunIcon className="size-6 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />

                    <MoonIcon className="size-5 absolute rotate-90 scale-0 dark:rotate-0 dark:scale-100" />

                    <span className="sr-only">
                        <AutoTranslate tKey="toggle_theme" namespace="toggle_theme">
                            Toggle theme
                        </AutoTranslate>
                    </span>
                </Button>
            </DropdownTrigger>

            <DropdownMenu
                aria-label={autoTranslate("themes_menu", "Themes Menu")}
                onAction={setTheme}
                itemClasses={{ title: "!text-lg ms-1" }}
            >
                <DropdownItem
                    key="light"
                    startContent={<SunIcon className="size-6 -mx-0.5" />}
                    title={autoTranslate("light", "Light")}
                />

                <DropdownItem
                    key="dark"
                    startContent={<MoonIcon className="size-5" />}
                    title={autoTranslate("dark", "Dark")}
                />

                <DropdownItem
                    key="system"
                    startContent={<ComputerDesktopIcon className="size-5" />}
                    title={autoTranslate("system", "System")}
                />
            </DropdownMenu>
        </Dropdown>
    )
})

export default ToggleTheme
