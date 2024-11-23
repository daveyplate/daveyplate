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
} from "@nextui-org/react"
import NotificationsCard from "./notifications/notifications-card"
import { BellIcon, Cog6ToothIcon, MagnifyingGlassIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline"
import { useSession } from "@supabase/auth-helpers-react"
import { useEntities, useEntity } from "@daveyplate/supabase-swr-entities/client"
import { useLocale } from "next-intl"
import Logo from "./logo"
import { useRouter } from "next/router"
import { useTheme } from "next-themes"
import ThemeDropdownMenu from "./theme-dropdown-menu"
import { useIsClient } from "@uidotdev/usehooks"
import { useState } from "react"

const siteName = process.env.NEXT_PUBLIC_SITE_NAME

const menuItems = [
    { name: "Home", path: "/" },
    { name: "Users", path: "/users" },
    { name: "Blog", path: "/blog" }, // Blog item added here
    { name: "Products", path: "/products" },
    { name: "Chat", path: "/chat" },
]

export default function NewHeader() {
    const router = useRouter()
    const session = useSession()
    const locale = useLocale()
    const isClient = useIsClient()
    const { resolvedTheme } = useTheme()
    const { entity: user } = useEntity(session && "profiles", session?.user.id, { lang: locale })
    const { entity: metadata } = useEntity(session && "metadata", "me")
    const { entities: notifications } = useEntities(session && "notifications", { lang: locale })
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
                className="ml-4 hidden h-12 w-full max-w-fit gap-4 rounded-full bg-content2 px-4 dark:bg-content1 md:flex"
                justify="end"
            >
                {menuItems.map((item) => (
                    <NavbarItem key={item.name} isActive={router.pathname === item.path}>
                        <Link
                            className="flex gap-2 text-inherit"
                            href={item.path}
                        >
                            {item.name}
                        </Link>
                    </NavbarItem>
                ))}
            </NavbarContent>

            <NavbarContent
                className={cn(isClient ? "opacity-1" : "opacity-0",
                    "ml-auto flex h-12 max-w-fit items-center gap-0 rounded-full p-0 md:bg-content2 md:px-1 md:dark:bg-content1"
                )}
                justify="end"
            >
                <NavbarItem className="hidden">
                    <Button isIconOnly radius="full" variant="light">
                        <MagnifyingGlassIcon className="text-default-500 size-6" />
                    </Button>
                </NavbarItem>

                <NavbarItem className="flex">
                    <Dropdown className="min-w-0">
                        <DropdownTrigger>
                            <Button isIconOnly radius="full" variant="light">
                                {isClient && (resolvedTheme == "dark" ? (
                                    <MoonIcon className="text-default-500 size-6" />
                                ) : (
                                    <SunIcon className="text-default-500 size-6" />
                                ))}
                            </Button>
                        </DropdownTrigger>

                        <ThemeDropdownMenu />
                    </Dropdown>

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
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <button className="mt-1 h-8 w-8 outline-none transition-transform">
                                <Badge
                                    className="border-transparent"
                                    color="success"
                                    content=""
                                    placement="bottom-right"
                                    shape="circle"
                                    size="sm"
                                >
                                    <Avatar size="sm" src={user?.avatar_url} name={user?.full_name} />
                                </Badge>
                            </button>
                        </DropdownTrigger>

                        <DropdownMenu aria-label="Profile Actions" variant="flat" className="-mb-2">
                            <DropdownSection title={session?.user.email || "Account"}>
                                <DropdownItem key="settings">My Settings</DropdownItem>
                                <DropdownItem key="team_settings">Team Settings</DropdownItem>
                                <DropdownItem key="analytics">Analytics</DropdownItem>
                                <DropdownItem key="system">System</DropdownItem>
                                <DropdownItem key="configurations">Configurations</DropdownItem>
                                <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
                                <DropdownItem key="logout" color="danger">
                                    Log Out
                                </DropdownItem>
                            </DropdownSection>
                        </DropdownMenu>
                    </Dropdown>
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
                            {item.name}
                        </Link>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
        </Navbar>
    )
}
