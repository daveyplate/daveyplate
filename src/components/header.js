import { useEffect, useState } from "react"

import NextImage from "next/image"
import { useRouter } from "next/router"

import { useSession, useSessionContext } from "@supabase/auth-helpers-react"

import { Network } from '@capacitor/network'
import { Capacitor } from "@capacitor/core"

import { cn } from "@nextui-org/react"
import { AnimatePresence, motion } from "framer-motion"

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'

import {
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

import Link from "@/components/locale-link"
import { localeHref } from "@/components/locale-link"

import UserAvatar from "@/components/user-avatar"

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
import PageTitle from "./page-title"
import { useDocumentTitle } from "@daveyplate/use-document-title"

import ThemeDropdown from "./theme-dropdown"
import { useEntity } from "@daveyplate/supabase-swr-entities/client"

const siteName = process.env.NEXT_PUBLIC_SITE_NAME

const logo = (
    <Image
        key={"logo"}
        as={NextImage}
        width={24}
        height={24}
        src="/icons/icon-512.png"
        alt={siteName}
    />
)

export default function Header({ locale, overrideTitle }) {
    const currentTitle = useDocumentTitle()
    const router = useRouter()
    const session = useSession()
    const { isLoading: sessionLoading } = useSessionContext()
    const { autoTranslate } = useAutoTranslate("header")
    const { entity: user, isLoading, error } = useEntity(session ? 'profiles' : null, 'me')

    const basePath = localeHref('/', locale)

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
                console.log('Network status changed', status.connected)
                setIsConnected(status.connected)
            })

            const logCurrentNetworkStatus = async () => {
                const status = await Network.getStatus()
                console.log('Network status:', status)
                setIsConnected(status.connected)
            }

            logCurrentNetworkStatus()

            return () => Network.removeAllListeners()
        }
    }, [])

    return (
        <>
            {!overrideTitle && <PageTitle locale={locale} />}

            <Navbar
                className="backdrop-blur-xl bg-background/70 pt-safe px-safe fixed"
                isMenuOpen={isMenuOpen}
                onMenuOpenChange={setIsMenuOpen}
                onClick={() => setIsMenuOpen(false)}
                shouldHideOnScroll
            >
                <NavbarContent className="sm:hidden" justify="start">
                    <AnimatePresence mode="popLayout">
                        {router.query.push ? (
                            <motion.div
                                key="backButton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <Button
                                    isIconOnly
                                    variant="link"
                                    onClick={() => router.back()}
                                    className="-ms-3 focus:text-foreground-400"
                                >
                                    <ChevronLeftIcon className="size-8" />
                                </Button>
                            </motion.div>
                        ) : (
                            <NavbarMenuToggle className="size-12 me-1" />
                        )}
                    </AnimatePresence>
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
                        {router.asPath == basePath && logo}

                        <p className="font-bold truncate max-w-[160px]" suppressHydrationWarning>
                            {currentTitle?.split('|')[0].trim()}
                        </p>
                    </NavbarBrand>
                </NavbarContent>

                <NavbarContent className="hidden sm:flex gap-4" justify="center">
                    {menuItems.map((item, index) => (
                        <NavbarItem key={index}>
                            <Link
                                className={cn("text-lg",
                                    router.asPath == localeHref(item.path, locale) ? "text-warning" : null)}
                                href={item.path}
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
                    className={cn("transition-all gap-2", isMenuOpen ? "opacity-0 pointer-events-none" : "")}
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
                                        href={{ pathname: `/user/[user_id]`, query: { user_id: user.id } }}
                                        startContent={<UserIcon className="size-5" />}
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        {autoTranslate('view_profile', 'View Profile')}
                                    </DropdownItem>
                                }

                                {user &&
                                    <DropdownItem
                                        as={Link}
                                        href={"/edit-profile"}
                                        startContent={<PencilIcon className="size-4 mx-0.5" />}
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        {autoTranslate('edit_profile', 'Edit Profile')}
                                    </DropdownItem>
                                }

                                {!session &&
                                    <DropdownItem
                                        as={Link}
                                        href={"/login"}
                                        startContent={<LogInIcon className="size-5" />}
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        {autoTranslate('login', 'Log In')}
                                    </DropdownItem>
                                }

                                {!session &&
                                    <DropdownItem
                                        as={Link}
                                        href={"/signup"}
                                        startContent={<UserPlusIcon className="size-5" />}
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        {autoTranslate('sign_up', 'Sign Up')}
                                    </DropdownItem>
                                }

                                <DropdownItem
                                    as={Link}
                                    href={"/settings"}
                                    startContent={<CogIcon className="size-5" />}
                                    onClick={(e) => e.preventDefault()}
                                >
                                    {autoTranslate('settings', 'Settings')}
                                </DropdownItem>

                                {session &&
                                    <DropdownItem
                                        as={Link}
                                        href={"/logout"}
                                        color="danger"
                                        startContent={<LogOutIcon className="size-5" />}
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        {autoTranslate('logout', 'Log Out')}
                                    </DropdownItem>
                                }
                            </DropdownMenu>
                        </Dropdown>
                    </NavbarItem>
                </NavbarContent>

                <NavbarMenu
                    className="overflow-hidden mt-safe gap-4 z-50"
                    onClick={() => setIsMenuOpen(false)}
                >
                    {menuItems.map((item, index) => (
                        <NavbarMenuItem key={index}>
                            <Link
                                className={cn("w-full flex gap-4 text-xl items-center",
                                    router.asPath == localeHref(item.path, locale) ? "text-warning" : "")}
                                href={item.path}
                                size="lg"
                                onClick={() => setIsMenuOpen(false)}
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