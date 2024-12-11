import { useSessionContext } from "@supabase/auth-helpers-react"
import { useLocale } from "next-intl"
import { useTheme } from "next-themes"
import { useRouter } from "next/router"
import { useState } from "react"

import { useEntity } from "@daveyplate/supabase-swr-entities/client"
import { useAutoTranslate } from 'next-auto-translate'

import {
    Badge,
    Button,
    cn,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Link,
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
    Skeleton
} from "@nextui-org/react"

import {
    ArrowLeftStartOnRectangleIcon,
    ArrowRightEndOnRectangleIcon,
    Cog6ToothIcon,
    MagnifyingGlassIcon,
    MoonIcon,
    PencilIcon,
    SunIcon,
    UserIcon,
    UserPlusIcon
} from "@heroicons/react/24/outline"

import { ThemeDropdown } from "@/components/theme-dropdown"
import { useIsHydrated } from "@/hooks/useIsHydrated"
import { getPathname, useLocaleRouter } from "@/i18n/routing"

import Logo from "@/components/logo"
import NotificationsPopover from "@/components/notifications/notifications-popover"
import UserAvatar from "@/components/user-avatar"

const siteName = process.env.NEXT_PUBLIC_SITE_NAME

const menuItems = [
    { name: "Home", path: "/" },
    { name: "Users", path: "/users" },
    { name: "Blog", path: "/blog" },
    { name: "Products", path: "/products" },
    { name: "Chat", path: "/chat" },
]

export default function Header() {
    const router = useRouter()
    const localeRouter = useLocaleRouter()
    const { session, isLoading: sessionLoading } = useSessionContext()
    const locale = useLocale()
    const isHydrated = useIsHydrated()
    const { resolvedTheme } = useTheme()
    const { entity: user, isLoading: userLoading } = useEntity(session && "profiles", "me", { lang: locale })
    const { autoTranslate } = useAutoTranslate("header")

    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <Navbar
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
            classNames={{
                base: cn("md:py-2", router.pathname == "/" && "bg-transparent backdrop-blur-none backdrop-saturate-100"),
                item: "data-[active=true]:text-primary",
                wrapper: "ps-4 pe-2 md:ps-6 md:pe-6",
            }}
            height="60px"
            position="sticky"
            onClick={() => setIsMenuOpen(false)}
        >
            <NavbarBrand>
                <NavbarMenuToggle className="me-3.5 h-6 md:hidden" />

                <Link href="/" className="text-foreground">
                    <Logo />

                    <p className="ms-2.5 font-bold text-inherit">
                        {siteName}
                    </p>
                </Link>
            </NavbarBrand>

            {!sessionLoading && (
                <>
                    <NavbarContent
                        className={cn(
                            "animate-in fade-in ml-4 hidden h-12 w-full max-w-fit gap-4 rounded-full bg-content2 px-4 dark:bg-content1 md:flex transition-all"
                        )}
                        justify="end"
                    >
                        {menuItems.map((item) => (
                            <NavbarItem key={item.name} isActive={router.pathname === item.path}>
                                <Link
                                    className="flex gap-2 text-inherit"
                                    href={item.path}
                                >
                                    {autoTranslate(item.name, item.name)}
                                </Link>
                            </NavbarItem>
                        ))}
                    </NavbarContent>

                    <NavbarContent
                        className={cn(
                            "animate-in fade-in -me-1 ml-auto flex h-12 max-w-fit items-center gap-0 rounded-full p-0 md:bg-content2 md:px-1 md:dark:bg-content1 transition-all"
                        )}
                        justify="end"
                    >
                        <NavbarItem className="hidden">
                            <Button isIconOnly radius="full" variant="light">
                                <MagnifyingGlassIcon className="text-default-500 size-6" />
                            </Button>
                        </NavbarItem>

                        <NavbarItem className="flex">
                            <ThemeDropdown className="min-w-0">
                                <Button isIconOnly radius="full" variant="light" disableRipple>
                                    {isHydrated && (resolvedTheme == "dark" ? (
                                        <MoonIcon className="text-default-500 size-6" />
                                    ) : (
                                        <SunIcon className="text-default-500 size-6" />
                                    ))}
                                </Button>
                            </ThemeDropdown>
                        </NavbarItem>

                        <NavbarItem className="hidden lg:flex">
                            <Button
                                as={Link}
                                href="/settings"
                                isIconOnly
                                radius="full"
                                variant="light"
                            >
                                <Cog6ToothIcon className="text-default-500 size-6" />
                            </Button>
                        </NavbarItem>

                        {session && (
                            <NavbarItem className="flex">
                                <NotificationsPopover key={router.pathname} />
                            </NavbarItem>
                        )}

                        <NavbarItem className="px-2">
                            <Badge
                                className="border-transparent pointer-events-none"
                                color="success"
                                content=""
                                placement="bottom-right"
                                shape="circle"
                                size="sm"
                            >
                                <Dropdown placement="bottom-end">
                                    <DropdownTrigger>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            radius="full"
                                            className="mt-1"
                                            disableRipple
                                        >
                                            <Skeleton className="rounded-full" isLoaded={!userLoading && !sessionLoading}>
                                                <UserAvatar size="sm" user={user} />
                                            </Skeleton>
                                        </Button>
                                    </DropdownTrigger>

                                    <DropdownMenu aria-label={autoTranslate("profile_actions", "Profile Actions")} variant="flat" className="-mb-2">
                                        <DropdownSection title={session?.user.email || autoTranslate("account", "Account")}>
                                            {session && (
                                                <DropdownItem
                                                    key="view_profile"
                                                    startContent={<UserIcon className="size-5" />}
                                                    onPress={() => {
                                                        const url = getPathname({ href: `/user?user_id=${user.id}`, locale })
                                                        const urlAs = getPathname({ href: `/user/${user.id}`, locale })
                                                        router.push(url, urlAs)
                                                    }}
                                                >
                                                    {autoTranslate("view_profile", "View Profile")}
                                                </DropdownItem>
                                            )}

                                            {session && (
                                                <DropdownItem
                                                    key="edit_profile"
                                                    onPress={() => localeRouter.push("/edit-profile")}
                                                    startContent={<PencilIcon className="size-5" />}
                                                >
                                                    {autoTranslate("edit_profile", "Edit Profile")}
                                                </DropdownItem>
                                            )}

                                            <>
                                                {!session && (
                                                    <DropdownItem
                                                        key="log_in"
                                                        onPress={() => localeRouter.push("/login")}
                                                        startContent={<ArrowRightEndOnRectangleIcon className="size-5" />}
                                                    >
                                                        {autoTranslate("log_in", "Log In")}
                                                    </DropdownItem>
                                                )}

                                                {!session && (
                                                    <DropdownItem
                                                        key="sign_up"
                                                        onPress={() => localeRouter.push("/signup")}
                                                        startContent={<UserPlusIcon className="size-5" />}
                                                    >
                                                        {autoTranslate("sign_up", "Sign Up")}
                                                    </DropdownItem>
                                                )}
                                            </>

                                            <DropdownItem
                                                key="settings"
                                                onPress={() => localeRouter.push("/settings")}
                                                startContent={<Cog6ToothIcon className="size-5" />}
                                            >
                                                {autoTranslate('settings', 'Settings')}
                                            </DropdownItem>

                                            {session &&
                                                <DropdownItem
                                                    key="log_out"
                                                    onPress={() => localeRouter.push("/logout")}
                                                    color="danger"
                                                    startContent={<ArrowLeftStartOnRectangleIcon className="size-5" />}
                                                >
                                                    {autoTranslate('logout', 'Log Out')}
                                                </DropdownItem>
                                            }
                                        </DropdownSection>
                                    </DropdownMenu>
                                </Dropdown>
                            </Badge>
                        </NavbarItem>
                    </NavbarContent>
                </>
            )}



            {/* Mobile Menu */}
            <NavbarMenu className="z-50">
                {menuItems.map((item) => (
                    <NavbarMenuItem
                        key={item.name}
                        isActive={router.pathname === item.path}
                    >
                        <Link
                            className="w-full"
                            color={router.pathname === item.path ? "primary" : "foreground"}
                            href={item.path}
                            onPress={() => setIsMenuOpen(false)}
                        >
                            {autoTranslate(item.name, item.name)}
                        </Link>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
        </Navbar>
    )
}