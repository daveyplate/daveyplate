import { BellIcon } from "@heroicons/react/24/solid"
import { Popover, PopoverTrigger, PopoverContent, Button, Badge, Card } from "@nextui-org/react"
import { useEntities, useEntity, useUpdateEntities } from "@daveyplate/supabase-swr-entities/client"
import { useSession } from "@supabase/auth-helpers-react"
import { useLocale } from "next-intl"
import { useEffect, useState } from "react"
import NotificationItem from "./notification-item"
import { toast } from "sonner"
import NotificationsCard from "./notifications-card"
import { useRouter } from "next/router"

export default function NotificationsPopover() {
    const session = useSession()
    const router = useRouter()
    const locale = useLocale()
    const [previousNotifications, setPreviousNotifications] = useState([])
    const {
        entities: notifications,
        mutate: mutateNotifications,
        updateEntity: updateNotification,
        deleteEntity: deleteNotification
    } = useEntities(session && "notifications", { lang: locale })
    const unseenNotifications = notifications?.filter((notification) => !notification.is_seen)
    const { entity: metadata } = useEntity(session && "metadata", "me")
    const updateEntities = useUpdateEntities()
    const [isOpen, setIsOpen] = useState(false)

    // Mark all notifications as seen when the popover is opened
    useEffect(() => {
        if (!isOpen) return
        if (!unseenNotifications?.length) return

        updateEntities("notifications", null, { is_seen: true }).then(() => {
            mutateNotifications()
        })
    }, [isOpen, notifications, mutateNotifications])

    useEffect(() => {
        if (!notifications) return
        mutateNotifications()
    }, [router.asPath])

    useEffect(() => {
        setPreviousNotifications(notifications)
        if (!previousNotifications) return

        // Compare the notifications to see if any new one exists that wasn't here before based on notification.id
        const newNotifications = notifications?.filter((notification) => {
            // Skip read notifications
            if (notification.is_read) return false
            if (notification.is_seen) return false

            // Skip notifications that are more than 1 minute old
            const notificationCreatedAt = new Date(notification.created_at)
            const now = new Date()
            if (now - notificationCreatedAt > 60000) return false

            return !previousNotifications?.some((previousNotification) => previousNotification.id == notification.id)
        })

        if (!newNotifications?.length) return

        toast((
            <div
                draggable
                onDragStart={(event) => {
                    event.preventDefault()
                    toast.dismiss()
                }}
                onTouchEnd={() => toast.dismiss()}
            >
                <NotificationItem
                    notification={notifications[0]}
                    updateNotification={updateNotification}
                    deleteNotification={updateNotification}
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
            placement="bottom-end"
            isOpen={isOpen}
            onOpenChange={(open) => setIsOpen(open)}
            shouldBlockScroll
            backdrop="opaque"
            size="lg"
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
                        content={unseenNotifications?.length}
                        isInvisible={!unseenNotifications?.length || !metadata?.notifications_badge_enabled}
                        showOutline={false}
                    >
                        <BellIcon className="size-7" />
                    </Badge>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="max-w-[94svw] p-0 sm:max-w-[480px] w-svw">
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