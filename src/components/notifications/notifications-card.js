import { useEffect, useState } from "react"
import { useLocale } from "next-intl"
import { useSession } from "@supabase/auth-helpers-react"

import { useEntities, useUpdateEntities } from "@daveyplate/supabase-swr-entities/client"

import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Tabs,
    Tab,
    ScrollShadow,
    CardFooter,
} from "@nextui-org/react"

import { BellSlashIcon } from "@heroicons/react/24/solid"

import { Link } from "@/i18n/routing"
import NotificationItem from "@/components/notifications/notification-item"

export default function NotificationsCard({ notifications: fallbackData, setIsOpen, ...props }) {
    const session = useSession()
    const locale = useLocale()

    const {
        entities: notifications,
        mutate: mutateNotifications,
        updateEntity: updateNotification,
        deleteEntity: deleteNotification,
    } = useEntities(session && "notifications", { lang: locale }, { fallbackData })
    const updateEntities = useUpdateEntities()

    const [activeTab, setActiveTab] = useState("all")

    const activeNotifications = notifications?.filter((notification) => activeTab == "all" || !notification.is_read)
    const unreadNotifications = notifications?.filter((notification) => !notification.is_read)

    // Mark all notifications as seen
    useEffect(() => {
        const unseenNotifications = notifications?.filter((notification) => !notification.is_seen)
        if (!unseenNotifications?.length) return

        updateEntities("notifications", null, { is_seen: true }).then(() => {
            mutateNotifications()
        })
    }, [notifications])

    return (
        <Card fullWidth className="max-w-[420px]" {...props}>
            <CardHeader className="flex flex-col px-0 pb-0">
                <div className="flex w-full items-center justify-between px-5 py-2">
                    <div className="inline-flex items-center gap-1">
                        <h4 className="inline-block align-middle text-large font-medium">
                            Notifications
                        </h4>

                        <Chip size="sm" variant="flat">
                            {notifications?.length}
                        </Chip>
                    </div>

                    <Button className="h-8 px-3" color="primary" radius="full" variant="light">
                        Mark all as read
                    </Button>
                </div>

                <Tabs
                    aria-label="Notifications"
                    classNames={{
                        base: "w-full",
                        tabList: "gap-6 px-6 py-0 w-full relative rounded-none border-b border-default",
                        cursor: "w-full",
                        tab: "max-w-fit px-2 h-12",
                    }}
                    color="primary"
                    selectedKey={activeTab}
                    variant="underlined"
                    onSelectionChange={setActiveTab}
                >
                    <Tab
                        key="all"
                        title={
                            <div className="flex items-center space-x-2">
                                <span>
                                    All
                                </span>

                                <Chip size="sm" variant="flat">
                                    {notifications?.length}
                                </Chip>
                            </div>
                        }
                    />

                    <Tab
                        key="unread"
                        title={
                            <div className="flex items-center space-x-2">
                                <span>
                                    Unread
                                </span>

                                <Chip size="sm" variant="flat">
                                    {unreadNotifications?.length}
                                </Chip>
                            </div>
                        }
                    />
                </Tabs>
            </CardHeader>

            <CardBody className="w-full gap-0 p-0">
                <ScrollShadow className="h-[420px] w-full">
                    {activeNotifications?.length ? (
                        activeNotifications
                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                            .map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    setIsOpen={setIsOpen}
                                    updateNotification={updateNotification}
                                    deleteNotification={deleteNotification}
                                />
                            ))
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                            <BellSlashIcon className="text-default-400 size-16" />

                            <p className="text-small text-default-400">
                                No notifications yet.
                            </p>
                        </div>
                    )}
                </ScrollShadow>
            </CardBody>

            <CardFooter className="justify-end gap-2 px-4">
                <Button
                    as={Link}
                    href="/settings"
                    variant="light"
                    onPress={() => setIsOpen(false)}
                >
                    Settings
                </Button>

                <Button
                    variant="flat"
                >
                    Archive All
                </Button>
            </CardFooter>
        </Card>
    )
}
