import { useState } from "react"
import { useRouter } from "next/router"
import { useTheme } from "next-themes"
import { useSessionContext } from "@supabase/auth-helpers-react"
import { useIsClient } from "@uidotdev/usehooks"
import { useLocale } from "next-intl"

import { useAutoTranslate } from 'next-auto-translate'
import { useEntities, useEntity } from "@daveyplate/supabase-swr-entities/client"

import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
    Link,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Avatar,
    Badge,
    cn,
    DropdownSection,
    Skeleton,
} from "@nextui-org/react"

import {
    BellIcon,
    Cog6ToothIcon,
    MagnifyingGlassIcon,
    SunIcon,
    MoonIcon,
    UserPlusIcon,
    ArrowRightEndOnRectangleIcon,
    UserIcon,
    ArrowLeftStartOnRectangleIcon,
    PencilIcon
} from "@heroicons/react/24/outline"

import Logo from "@/components/logo"
import { ThemeDropdown } from "@/components/theme-dropdown"
import NotificationsCard from "@/components/notifications/notifications-card"
import { getPathname } from "@/i18n/routing"

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
    const { session, isLoading: sessionLoading } = useSessionContext()
    const locale = useLocale()
    const isClient = useIsClient()
    const { resolvedTheme } = useTheme()
    const { entity: user, isLoading: userLoading } = useEntity(session && "profiles", session?.user.id, { lang: locale })
    const { entity: metadata } = useEntity(session && "metadata", "me")
    const { entities: notifications } = useEntities(session && "notifications", { lang: locale })
    const { autoTranslate } = useAutoTranslate("header")

    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const unseenNotifications = notifications?.filter((notification) => !notification.is_seen)

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
                <NavbarMenuToggle className="ms-1 me-3.5 h-6 md:hidden" />

                <Link href="/" className="text-foreground">
                    <Logo />

                    <p className="ms-2.5 font-bold text-inherit">
                        {siteName}
                    </p>
                </Link>
            </NavbarBrand>

            <NavbarContent
                className={cn(!sessionLoading ? "opacity-1" : "opacity-0",
                    "ml-4 hidden h-12 w-full max-w-fit gap-4 rounded-full bg-content2 px-4 dark:bg-content1 md:flex transition-all"
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
                className={cn(!sessionLoading ? "opacity-1" : "opacity-0",
                    "ml-auto flex h-12 max-w-fit items-center gap-0 rounded-full p-0 md:bg-content2 md:px-1 md:dark:bg-content1 transition-all"
                )}
                justify="end"
            >
                <NavbarItem className="hidden">
                    <Button isIconOnly radius="full" variant="light">
                        <MagnifyingGlassIcon className="text-default-500 size-6" />
                    </Button>
                </NavbarItem>

                <NavbarItem className="flex">
                    <ThemeDropdown>
                        <Button isIconOnly radius="full" variant="light">
                            {isClient && (resolvedTheme == "dark" ? (
                                <MoonIcon className="text-default-500 size-6" />
                            ) : (
                                <SunIcon className="text-default-500 size-6" />
                            ))}
                        </Button>
                    </ThemeDropdown>
                </NavbarItem>

                <NavbarItem className="hidden md:flex">
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
                        <Popover offset={12} placement="bottom-end">
                            <PopoverTrigger>
                                <Button
                                    disableRipple
                                    isIconOnly
                                    className="overflow-visible"
                                    radius="full"
                                    variant="light"
                                >
                                    <Badge
                                        color="danger"
                                        content={unseenNotifications?.length}
                                        showOutline={false}
                                        size="md"
                                        isInvisible={!metadata?.notifications_badge_enabled || !unseenNotifications?.length}
                                    >
                                        <BellIcon className="text-default-500 size-6" />
                                    </Badge>
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="max-w-[90vw] p-0 md:max-w-[380px]">
                                <NotificationsCard
                                    notifications={notifications}
                                    className="w-full shadow-none"
                                />
                            </PopoverContent>
                        </Popover>
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
                                        <Avatar size="sm" src={user?.avatar_url} name={user?.full_name} />
                                    </Skeleton>
                                </Button>
                            </DropdownTrigger>

                            <DropdownMenu aria-label={autoTranslate("profile_actions", "Profile Actions")} variant="flat" className="-mb-2">
                                <DropdownSection title={session?.user.email || autoTranslate("account", "Account")}>
                                    {session && (
                                        <DropdownItem
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
                                            href="/edit-profile"
                                            startContent={<PencilIcon className="size-5" />}
                                        >
                                            {autoTranslate("edit_profile", "Edit Profile")}
                                        </DropdownItem>
                                    )}

                                    {!session && (
                                        <DropdownItem
                                            href="/login"
                                            startContent={<ArrowRightEndOnRectangleIcon className="size-5" />}
                                        >
                                            {autoTranslate("log_in", "Log In")}
                                        </DropdownItem>
                                    )}

                                    {!session && (
                                        <DropdownItem
                                            href="/signup"
                                            startContent={<UserPlusIcon className="size-5" />}
                                        >
                                            {autoTranslate("sign_up", "Register")}
                                        </DropdownItem>
                                    )}

                                    <DropdownItem
                                        href={"/settings"}
                                        startContent={<Cog6ToothIcon className="size-5" />}
                                    >
                                        {autoTranslate('settings', 'Settings')}
                                    </DropdownItem>

                                    {session &&
                                        <DropdownItem
                                            href={"/logout"}
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

            {/* Mobile Menu */}
            <NavbarMenu>
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