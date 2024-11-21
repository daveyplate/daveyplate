import { BellIcon } from "@heroicons/react/24/solid"
import { Popover, PopoverTrigger, PopoverContent, Button, Badge, Card } from "@nextui-org/react"
import { useEntities, useEntity, useUpdateEntities } from "@daveyplate/supabase-swr-entities/client"
import { useSession } from "@supabase/auth-helpers-react"
import NotificationsContainer from "./notifications-card"
import { useLocale } from "next-intl"
import { useEffect, useState } from "react"
import NotificationItem from "./notification-item"
import { toast } from "sonner"

export default function NotificationsPopover() {
    const session = useSession()
    const locale = useLocale()
    const { entities: notifications, mutate } = useEntities(session && "notifications", { lang: locale })
    const unseenNotifications = notifications?.filter((notification) => !notification.is_seen)
    const { entity: metadata } = useEntity(session && "metadata", "me")
    const updateEntities = useUpdateEntities()
    const [isOpen, setIsOpen] = useState(false)

    // Mark all notifications as seen when the popover is opened
    useEffect(() => {
        if (!isOpen) return
        if (!unseenNotifications?.length) return

        updateEntities("notifications", null, { is_seen: true }).then(() => {
            mutate()
        })
    }, [isOpen, notifications, mutate])

    useEffect(() => {
        if (!notifications?.length) return

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
                <NotificationsContainer notifications={notifications} setIsOpen={setIsOpen} />
            </PopoverContent>
        </Popover>
    )
}