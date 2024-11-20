import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/router"

import { useSessionContext } from "@supabase/auth-helpers-react"

import { Network } from '@capacitor/network'
import { Capacitor } from "@capacitor/core"

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'
import { useEntity } from "@daveyplate/supabase-swr-entities/client"
import { usePageTitle } from "@daveyplate/next-page-title"

import {
    cn,
    Badge,
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    DropdownSection,
    Skeleton,
    Button,
} from "@nextui-org/react"

import {
    HomeIcon,
    ArrowRightEndOnRectangleIcon as LogInIcon,
    ArrowLeftStartOnRectangleIcon as LogOutIcon,
    UserIcon,
    PencilIcon,
    CogIcon,
    UserPlusIcon,
    UsersIcon,
    ShoppingBagIcon,
    ChatBubbleLeftRightIcon,
    ChevronLeftIcon,
    NewspaperIcon
} from '@heroicons/react/24/solid'

import { getPathname, Link, useLocaleRouter, usePathname } from "@/i18n/routing"

import ThemeDropdown from "@/components/theme-dropdown"
import UserAvatar from "@/components/user-avatar"
import NotificationsPopover from "./notifications/notifications-popover"
import { useLocale } from "next-intl"

const siteName = process.env.NEXT_PUBLIC_SITE_NAME

const logo = (
    <Image
        width={24}
        height={24}
        src="/apple-touch-icon.png"
        alt={siteName}
        className="rounded-full"
    />
)

export default function Header({ canGoBack }) {
    const locale = useLocale()
    const { pageTitle } = usePageTitle()
    const router = useRouter()
    const localeRouter = useLocaleRouter()
    const pathname = usePathname()
    const { autoTranslate } = useAutoTranslate("header")
    const { session, isLoading: sessionLoading } = useSessionContext()
    const { entity: user, isLoading: userLoading, error: userError } = useEntity(session ? 'profiles' : null, 'me', { lang: locale })

    const [isConnected, setIsConnected] = useState(true)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const menuItems = [
        { icon: HomeIcon, name: "Home", path: "/" },
        { icon: UsersIcon, name: "Users", path: "/users" },
        { icon: NewspaperIcon, name: "Blog", path: "/blog" }, // Blog item added here
        { icon: ShoppingBagIcon, name: "Products", path: "/products" },
        { icon: ChatBubbleLeftRightIcon, name: "Chat", path: "/chat" },
    ]

    useEffect(() => {
        if (Capacitor.isPluginAvailable('Network')) {
            Network.addListener('networkStatusChange', status => {
                setIsConnected(status.connected)
            })

            const logCurrentNetworkStatus = async () => {
                const status = await Network.getStatus()
                setIsConnected(status.connected)
            }

            logCurrentNetworkStatus()

            return () => Network.removeAllListeners()
        }
    }, [])

    const goBack = () => {
        if (document.referrer && !document.referrer.includes(window.location.origin)) {
            localeRouter.replace("/")
        } else if (window.history?.length) {
            router.back()
        } else {
            localeRouter.replace("/")
        }
    }

    return (
        <>
            <Navbar
                className="backdrop-blur-xl bg-gradient-to-b from-background via-background/30 to-background/0 pt-safe px-safe fixed"
                isMenuOpen={isMenuOpen}
                onMenuOpenChange={setIsMenuOpen}
                onClick={() => setIsMenuOpen(false)}
            >
                <NavbarContent className="sm:hidden" justify="start">
                    {canGoBack ? (
                        <Button
                            isIconOnly
                            variant="light"
                            onPress={goBack}
                            className="!bg-transparent -ms-3"
                            disableRipple
                        >
                            <ChevronLeftIcon className="size-8" />
                        </Button>
                    ) : (
                        <NavbarMenuToggle />
                    )}
                </NavbarContent>

                <NavbarContent className="hidden sm:flex" justify="start">
                    <NavbarBrand className="gap-2 mb-0.5" as={Link} href="/">
                        {logo}

                        <h4>
                            {siteName}
                        </h4>
                    </NavbarBrand>
                </NavbarContent>

                <NavbarContent className="sm:hidden me-1" justify="center">
                    <NavbarBrand className="gap-2">
                        {pathname == "/" && logo}

                        <h4 className="truncate max-w-[160px]" suppressHydrationWarning>
                            {pageTitle}
                        </h4>
                    </NavbarBrand>
                </NavbarContent>

                <NavbarContent className="hidden sm:flex gap-4" justify="center">
                    {menuItems.map((item, index) => (
                        <NavbarItem key={index}>
                            <Link
                                href={item.path}
                                className={cn("text-lg", pathname == item.path && "text-warning")}
                            >
                                <AutoTranslate tKey={item.name} namespace="header">
                                    {item.name}
                                </AutoTranslate>
                            </Link>
                        </NavbarItem>
                    ))}
                </NavbarContent>

                <NavbarContent
                    justify="end"
                    className={cn("transition-all gap-3", isMenuOpen && "opacity-0 pointer-events-none")}
                >
                    <NavbarItem>
                        {session ? (
                            <NotificationsPopover />
                        ) : (
                            <ThemeDropdown isIconOnly variant="light" />
                        )}
                    </NavbarItem>

                    <NavbarItem className="mt-1 -me-1">
                        <Dropdown>
                            <DropdownTrigger>
                                <Skeleton as={Button} isIconOnly className="rounded-full !overflow-hidden" isLoaded={!userLoading && !sessionLoading}>
                                    <UserAvatar
                                        user={user}
                                    />
                                </Skeleton>
                            </DropdownTrigger>

                            <DropdownMenu
                                aria-label={autoTranslate("profile_actions", "Profile actions")}
                                itemClasses={{
                                    title: "text-base",
                                    base: "text-foreground gap-3 px-3"
                                }}
                            >
                                <DropdownSection
                                    className="truncate pt-1"
                                    title={session?.user.email || autoTranslate("account", "Account")}
                                    classNames={{ heading: "text-base" }}
                                    showDivider
                                />

                                {user?.id &&
                                    <DropdownItem
                                        startContent={<UserIcon className="size-5" />}
                                        onPress={() => {
                                            const url = getPathname({ href: `/user?user_id=${user.id}`, locale })
                                            const urlAs = getPathname({ href: `/user/${user.id}`, locale })
                                            router.push(url, urlAs)
                                        }}
                                    >
                                        {autoTranslate('view_profile', 'View Profile')}
                                    </DropdownItem>
                                }

                                {user &&
                                    <DropdownItem
                                        href={"/edit-profile"}
                                        startContent={<PencilIcon className="size-4 mx-0.5" />}
                                    >
                                        {autoTranslate('edit_profile', 'Edit Profile')}
                                    </DropdownItem>
                                }

                                {!session &&
                                    <DropdownItem
                                        href={"/login"}
                                        startContent={<LogInIcon className="size-5" />}
                                    >
                                        {autoTranslate('login', 'Log In')}
                                    </DropdownItem>
                                }

                                {!session &&
                                    <DropdownItem
                                        href={"/signup"}
                                        startContent={<UserPlusIcon className="size-5" />}
                                    >
                                        {autoTranslate('sign_up', 'Sign Up')}
                                    </DropdownItem>
                                }

                                <DropdownItem
                                    href={"/settings"}
                                    startContent={<CogIcon className="size-5" />}
                                >
                                    {autoTranslate('settings', 'Settings')}
                                </DropdownItem>

                                {session &&
                                    <DropdownItem
                                        href={"/logout"}
                                        color="danger"
                                        startContent={<LogOutIcon className="size-5" />}
                                    >
                                        {autoTranslate('logout', 'Log Out')}
                                    </DropdownItem>
                                }
                            </DropdownMenu>
                        </Dropdown>
                    </NavbarItem>
                </NavbarContent>

                <NavbarMenu className="overflow-hidden mt-safe gap-0 pt-0">
                    {menuItems.map((item, index) => (
                        <NavbarMenuItem key={index}>
                            <Button
                                as={Link}
                                href={item.path}
                                size="lg"
                                variant="light"
                                fullWidth
                                className={
                                    cn("justify-start text-xl gap-4",
                                        pathname == item.path && "text-warning")
                                }
                                startContent={
                                    <item.icon className="size-6 -ms-1" />
                                }
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <AutoTranslate tKey={item.name} namespace="header">
                                    {item.name}
                                </AutoTranslate>
                            </Button>
                        </NavbarMenuItem>
                    ))}
                </NavbarMenu>
            </Navbar>
        </>
    )
}