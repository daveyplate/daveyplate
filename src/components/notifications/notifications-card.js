import { useSessionContext } from "@supabase/auth-helpers-react"
import { useLocale } from "next-intl"
import { useEffect, useState } from "react"

import { useDeleteEntities, useEntities, useUpdateEntities } from "@daveyplate/supabase-swr-entities/client"
import { useAutoTranslate } from 'next-auto-translate'

import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Chip,
    ScrollShadow,
    Tab,
    Tabs,
} from "@nextui-org/react"

import { BellSlashIcon } from "@heroicons/react/24/solid"

import NotificationItem from "@/components/notifications/notification-item"
import { Link } from "@/i18n/routing"
import NotificationSkeleton from "./notification-skeleton"

export default function NotificationsCard({ notifications: fallbackData, setIsOpen, ...props }) {
    const { session, isLoading: sessionLoading } = useSessionContext()
    const locale = useLocale()
    const { autoTranslate } = useAutoTranslate("notifications")

    const {
        entities: notifications,
        mutate: mutateNotifications,
        updateEntity: updateNotification,
        deleteEntity: deleteNotification,
        isLoading: notificationsLoading,
    } = useEntities(session && "notifications", { lang: locale }, { fallbackData })
    const updateEntities = useUpdateEntities()
    const deleteEntities = useDeleteEntities()

    const isLoading = sessionLoading || notificationsLoading

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
        <Card fullWidth {...props}>
            <CardHeader className="flex flex-col px-0 pb-0">
                <div className="flex w-full items-center justify-between px-5 py-2">
                    <div className="inline-flex items-center gap-1">
                        <h4 className="inline-block align-middle text-large font-medium">
                            {autoTranslate("notifications", "Notifications")}
                        </h4>

                        {!!notifications?.length && (
                            <Chip size="sm" variant="flat">
                                {notifications?.length}
                            </Chip>
                        )}
                    </div>

                    {!!unreadNotifications?.length && (
                        <Button
                            className="h-8 px-3 -me-2"
                            color="primary"
                            radius="full"
                            variant="light"
                            onPress={() => {
                                updateEntities("notifications", null, { is_read: true }).then(() => {
                                    mutateNotifications()
                                })
                            }}
                        >
                            {autoTranslate("mark_all_as_read", "Mark all as read")}
                        </Button>
                    )}
                </div>

                <Tabs
                    aria-label={autoTranslate("notifications", "Notifications")}
                    classNames={{
                        base: "w-full",
                        tabList: "gap-6 px-6 py-0 w-full relative rounded-none border-b border-divider",
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
                                    {autoTranslate("all", "All")}
                                </span>

                                {!!notifications?.length && (
                                    <Chip size="sm" variant="flat">
                                        {notifications?.length}
                                    </Chip>
                                )}
                            </div>
                        }
                    />

                    <Tab
                        key="unread"
                        title={
                            <div className="flex items-center space-x-2">
                                <span>
                                    {autoTranslate("unread", "Unread")}
                                </span>

                                {!!unreadNotifications?.length && (
                                    <Chip size="sm" variant="flat">
                                        {unreadNotifications?.length}
                                    </Chip>
                                )}
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
                    ) : isLoading ? (
                        [...Array(3)].map((_, index) => <NotificationSkeleton key={index} />)
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                            <BellSlashIcon className="text-default-400 size-16" />

                            <p className="text-small text-default-400">
                                {autoTranslate("no_notifications_yet", "No notifications yet.")}
                            </p>
                        </div>
                    )}
                </ScrollShadow>
            </CardBody>

            <CardFooter className="justify-end gap-2 px-4">
                <Button
                    as={Link}
                    href="/settings?tab=notifications"
                    variant="light"
                    onPress={() => setIsOpen(false)}
                >
                    {autoTranslate("settings", "Settings")}
                </Button>

                {!!notifications?.length && (
                    <Button
                        variant="flat"
                        onPress={() => {
                            mutateNotifications([])
                            deleteEntities("notifications").then(() => {
                                mutateNotifications()
                            })
                        }}
                    >
                        {autoTranslate("archive_all", "Archive All")}
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
