import { useSession } from "@supabase/auth-helpers-react"
import { useLocale } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { useEntities, useEntity } from "@daveyplate/supabase-swr-entities/client"

import { BellIcon } from "@heroicons/react/24/outline"
import { Badge, Button, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react"

import NotificationItem from "@/components/notifications/notification-item"
import NotificationsCard from "@/components/notifications/notifications-card"

export default function NotificationsPopover() {
    const locale = useLocale()
    const session = useSession()

    const { entity: metadata } = useEntity(session && "metadata", "me")
    const {
        entities: notifications,
        updateEntity: updateNotification,
        deleteEntity: deleteNotification
    } = useEntities(metadata?.notifications_enabled && "notifications", { lang: locale })

    const [badgeCount, setBadgeCount] = useState(0)
    const [previousNotifications, setPreviousNotifications] = useState([])
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        setBadgeCount(notifications?.filter((notification) => !notification.is_seen).length || 0)

        setPreviousNotifications(notifications)
        if (!previousNotifications) return

        // Compare the notifications to see if any new one exists that wasn't here before based on notification.id
        const newNotifications = notifications?.filter((notification) => {
            // Skip seen notifications
            if (notification.is_read) return false
            if (notification.is_seen) return false

            // Skip notifications that are more than 1 minute old
            const notificationCreatedAt = new Date(notification.created_at)
            const now = new Date()
            if (now - notificationCreatedAt > 60000) return false

            return !previousNotifications?.some((previousNotification) => previousNotification.id == notification.id)
        })

        if (!newNotifications?.length) return

        toast.custom((t) => (
            <div
                draggable
                onDragStart={(event) => {
                    event.preventDefault()
                    toast.dismiss(t)
                }}
                onTouchEnd={() => toast.dismiss()}
            >
                <NotificationItem
                    notification={notifications[0]}
                    updateNotification={updateNotification}
                    deleteNotification={deleteNotification}
                    setIsOpen={setIsOpen}
                    disableSwipe={true}
                    className="rounded-xl border"
                />
            </div>
        ), {
            position: "top-center",
            unstyled: true,
            dismissible: false
        })
    }, [notifications])

    return (
        <Popover
            offset={12}
            placement="bottom-end"
            isOpen={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open)
                setBadgeCount(0)
            }}
            shouldBlockScroll
        >
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
                        content={badgeCount}
                        isInvisible={!badgeCount || !metadata?.notifications_badge_enabled}
                        showOutline={false}
                    >
                        <BellIcon className="size-6 text-default-500" />
                    </Badge>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[94svw] p-0 sm:w-[420px] max-h-[88svh]">
                <NotificationsCard
                    notifications={notifications}
                    setIsOpen={setIsOpen}
                    updateNotification={updateNotification}
                    deleteNotification={deleteNotification}
                />
            </PopoverContent>
        </Popover>
    )
}