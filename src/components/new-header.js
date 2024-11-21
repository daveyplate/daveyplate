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
} from "@nextui-org/react"
import NotificationsCard from "./notifications/notifications-card"
import { BellIcon, Cog6ToothIcon, MagnifyingGlassIcon, SunIcon } from "@heroicons/react/24/outline"
import { useSession } from "@supabase/auth-helpers-react"
import { useEntity } from "@daveyplate/supabase-swr-entities/client"
import { useLocale } from "next-intl"
import Logo from "./logo"

const siteName = process.env.NEXT_PUBLIC_SITE_NAME

export default function NewHeader() {
    const session = useSession()
    const locale = useLocale()
    const { entity: user } = useEntity(session && "profiles", session?.user.id, { lang: locale })

    return (
        <Navbar
            classNames={{
                base: "md:py-2 bg-transparent",
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
                <NavbarItem>
                    <Link className="flex gap-2 text-inherit" href="#">
                        Dashboard
                    </Link>
                </NavbarItem>

                <NavbarItem isActive>
                    <Link aria-current="page" className="flex gap-2 text-inherit" href="#">
                        Deployments
                    </Link>
                </NavbarItem>

                <NavbarItem>
                    <Link className="flex gap-2 text-inherit" href="#">
                        Analytics
                    </Link>
                </NavbarItem>

                <NavbarItem>
                    <Link className="flex gap-2 text-inherit" href="#">
                        Team
                    </Link>
                </NavbarItem>

                <NavbarItem>
                    <Link className="flex gap-2 text-inherit" href="#">
                        Settings
                    </Link>
                </NavbarItem>
            </NavbarContent>

            <NavbarContent
                className="ml-auto flex h-12 max-w-fit items-center gap-0 rounded-full p-0 md:bg-content2 md:px-1 md:dark:bg-content1"
                justify="end"
            >
                <NavbarItem className="hidden">
                    <Button isIconOnly radius="full" variant="light">
                        <MagnifyingGlassIcon className="text-default-500 size-6" />
                    </Button>
                </NavbarItem>

                <NavbarItem className="hidden md:flex">
                    <Button isIconOnly radius="full" variant="light">
                        <SunIcon className="text-default-500 size-6" />
                    </Button>
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
                                <Badge color="danger" content="5" showOutline={false} size="md">
                                    <BellIcon className="text-default-500 size-6" />
                                </Badge>
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="max-w-[90vw] p-0 md:max-w-[380px]">
                            <NotificationsCard className="w-full shadow-none" />
                        </PopoverContent>
                    </Popover>
                </NavbarItem>

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

                        <DropdownMenu aria-label="Profile Actions" variant="flat">
                            <DropdownItem key="profile" className="h-14 gap-2">
                                <p className="font-semibold">Signed in as</p>
                                <p className="font-semibold">johndoe@example.com</p>
                            </DropdownItem>
                            <DropdownItem key="settings">My Settings</DropdownItem>
                            <DropdownItem key="team_settings">Team Settings</DropdownItem>
                            <DropdownItem key="analytics">Analytics</DropdownItem>
                            <DropdownItem key="system">System</DropdownItem>
                            <DropdownItem key="configurations">Configurations</DropdownItem>
                            <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
                            <DropdownItem key="logout" color="danger">
                                Log Out
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </NavbarItem>
            </NavbarContent>

            {/* Mobile Menu */}
            <NavbarMenu className="bg-transparent">
                <NavbarMenuItem>
                    <Link className="w-full" color="foreground" href="#">
                        Dashboard
                    </Link>
                </NavbarMenuItem>

                <NavbarMenuItem isActive>
                    <Link aria-current="page" className="w-full" color="primary" href="#">
                        Deployments
                    </Link>
                </NavbarMenuItem>

                <NavbarMenuItem>
                    <Link className="w-full" color="foreground" href="#">
                        Analytics
                    </Link>
                </NavbarMenuItem>

                <NavbarMenuItem>
                    <Link className="w-full" color="foreground" href="#">
                        Team
                    </Link>
                </NavbarMenuItem>

                <NavbarMenuItem>
                    <Link className="w-full" color="foreground" href="#">
                        Settings
                    </Link>
                </NavbarMenuItem>
            </NavbarMenu>
        </Navbar>
    );
}
