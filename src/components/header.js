import { useEffect, useState } from "react"
import NextImage from "next/image"
import { useRouter } from "next/router"

import { useSession, useSessionContext } from "@supabase/auth-helpers-react"

import { Network } from '@capacitor/network'
import { Capacitor } from "@capacitor/core"

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'
import { useDocumentTitle } from "@daveyplate/use-document-title"
import { useEntity } from "@daveyplate/supabase-swr-entities/client"

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
    Image,
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
    ChevronDownIcon,
    ArrowRightEndOnRectangleIcon as LogInIcon,
    ArrowLeftStartOnRectangleIcon as LogOutIcon,
    UserIcon,
    PencilIcon,
    CogIcon,
    UserPlusIcon,
    UsersIcon,
    ShoppingBagIcon,
    ChatBubbleLeftRightIcon,
    ChevronLeftIcon
} from '@heroicons/react/24/solid'

import { Link, useLocaleRouter, usePathname } from "@/i18n/routing"
import { dynamicHref } from "@/utils/utils"

import PageTitle from "@/components/page-title"
import ThemeDropdown from "@/components/theme-dropdown"
import UserAvatar from "@/components/user-avatar"

const siteName = process.env.NEXT_PUBLIC_SITE_NAME

const logo = (
    <Image
        key={"logo"}
        as={NextImage}
        width={24}
        height={24}
        src="/apple-touch-icon.png"
        alt={siteName}
    />
)

export default function Header({ overrideTitle, canGoBack }) {
    const currentTitle = useDocumentTitle()
    const router = useRouter()
    const localeRouter = useLocaleRouter()
    const session = useSession()
    const pathname = usePathname()
    const { isLoading: sessionLoading } = useSessionContext()
    const { autoTranslate } = useAutoTranslate("header")
    const { entity: user, isLoading, error } = useEntity(session ? 'profiles' : null, 'me')

    const [isConnected, setIsConnected] = useState(true)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const menuItems = [
        { icon: HomeIcon, name: "Home", path: "/" },
        { icon: UsersIcon, name: "Users", path: "/users" },
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
            {!overrideTitle && <PageTitle />}

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
                            className="-ms-4 focus:text-foreground-400 bg-transparent"
                            disableRipple
                        >
                            <ChevronLeftIcon className="size-8" />
                        </Button>
                    ) : (
                        <NavbarMenuToggle className="size-12 me-1" />
                    )}
                </NavbarContent>

                <NavbarContent className="hidden sm:flex" justify="start">
                    <NavbarBrand className="gap-2" as={Link} href="/">
                        {logo}

                        <p className="font-bold text-lg">
                            {siteName}
                        </p>
                    </NavbarBrand>
                </NavbarContent>

                <NavbarContent className="sm:hidden me-1" justify="center">
                    <NavbarBrand className="gap-2 text-foreground text-xl">
                        {pathname == "/" && logo}

                        <p className="font-bold truncate max-w-[160px]" suppressHydrationWarning>
                            {currentTitle?.split('|')[0].trim()}
                        </p>
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
                    className={cn("transition-all gap-2", isMenuOpen && "opacity-0 pointer-events-none")}
                >
                    <NavbarItem>
                        <ThemeDropdown isIconOnly variant="light" />
                    </NavbarItem>

                    <NavbarItem>
                        <Dropdown>
                            <DropdownTrigger>
                                <div className="hover:opacity-90 flex -me-1">
                                    <Badge
                                        as="button"
                                        isOneChar
                                        size="sm"
                                        color={(error || !isConnected) ? "danger" : (user ? "success" : "default")}
                                        content={
                                            <ChevronDownIcon className={cn("w-2.5 pt-0.5", (user || !isConnected) ? "invisible" : "")} />
                                        }
                                        shape="circle"
                                        placement="bottom-right"
                                    >
                                        <Skeleton className="rounded-full" isLoaded={!isLoading && !sessionLoading}>
                                            <UserAvatar
                                                as="button"
                                                user={user}
                                            />
                                        </Skeleton>
                                    </Badge>
                                </div>
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
                                    classNames={{ heading: "text-small" }}
                                    showDivider
                                />

                                {user?.id &&
                                    <DropdownItem
                                        as={Link}
                                        href={dynamicHref({ pathname: `/user/[user_id]`, query: { user_id: user.id } })}
                                        startContent={<UserIcon className="size-5" />}
                                    >
                                        {autoTranslate('view_profile', 'View Profile')}
                                    </DropdownItem>
                                }

                                {user &&
                                    <DropdownItem
                                        as={Link}
                                        href={"/edit-profile"}
                                        startContent={<PencilIcon className="size-4 mx-0.5" />}
                                    >
                                        {autoTranslate('edit_profile', 'Edit Profile')}
                                    </DropdownItem>
                                }

                                {!session &&
                                    <DropdownItem
                                        as={Link}
                                        href={"/login"}
                                        startContent={<LogInIcon className="size-5" />}
                                    >
                                        {autoTranslate('login', 'Log In')}
                                    </DropdownItem>
                                }

                                {!session &&
                                    <DropdownItem
                                        as={Link}
                                        href={"/signup"}
                                        startContent={<UserPlusIcon className="size-5" />}
                                    >
                                        {autoTranslate('sign_up', 'Sign Up')}
                                    </DropdownItem>
                                }

                                <DropdownItem
                                    as={Link}
                                    href={"/settings"}
                                    startContent={<CogIcon className="size-5" />}
                                >
                                    {autoTranslate('settings', 'Settings')}
                                </DropdownItem>

                                {session &&
                                    <DropdownItem
                                        as={Link}
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

                <NavbarMenu
                    className="overflow-hidden mt-safe gap-4"
                >
                    {menuItems.map((item, index) => (
                        <NavbarMenuItem key={index}>
                            <Link
                                href={item.path}
                                size="lg"
                                className={cn("w-full flex gap-4 text-xl items-center",
                                    pathname == item.path && "text-warning")}
                            >
                                <item.icon className="size-6" />

                                <AutoTranslate tKey={item.name} namespace="header">
                                    {item.name}
                                </AutoTranslate>
                            </Link>
                        </NavbarMenuItem>
                    ))}
                </NavbarMenu>
            </Navbar>
        </>
    )
}