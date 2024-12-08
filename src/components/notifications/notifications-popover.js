import { useSession } from "@supabase/auth-helpers-react"
import { useLocale } from "next-intl"
import { useEffect, useState } from "react"

import { useEntities, useEntity } from "@daveyplate/supabase-swr-entities/client"

import { BellIcon } from "@heroicons/react/24/outline"
import { Badge, Button, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react"

import NotificationsCard from "@/components/notifications/notifications-card"

export default function NotificationsPopover() {
    const locale = useLocale()
    const session = useSession()

    const { entity: metadata } = useEntity(session && "metadata", "me")
    const {
        entities: notifications,
        updateEntity: updateNotification,
        deleteEntity: deleteNotification
    } = useEntities(session && "notifications", { lang: locale })

    const [badgeCount, setBadgeCount] = useState(notifications?.filter((notification) => !notification.is_seen).length || 0)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        setBadgeCount(notifications?.filter((notification) => !notification.is_seen).length || 0)
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

            <PopoverContent className="w-[94dvw] p-0 sm:w-[420px] max-h-[88dvh]">
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