import { useSession } from "@supabase/auth-helpers-react"
import { useLocale } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { useEntities } from "@daveyplate/supabase-swr-entities/client"

import NotificationItem from "@/components/notifications/notification-item"
import { Notification } from "entity.types"

export default function NotificationToaster() {
    const locale = useLocale()
    const session = useSession()

    const {
        entities: notifications,
        updateEntity: updateNotification,
        deleteEntity: deleteNotification
    } = useEntities<Notification>(session && "notifications", { lang: locale })

    const [previousNotifications, setPreviousNotifications] = useState<Notification[]>([])

    useEffect(() => {
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
            if (now.getTime() - notificationCreatedAt.getTime() > 60000) return false

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

    return <></>
}