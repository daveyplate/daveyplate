import { BellIcon } from "@heroicons/react/24/solid"
import { Popover, PopoverTrigger, PopoverContent, Button, Badge } from "@nextui-org/react"
import { useEntities, useEntity } from "@daveyplate/supabase-swr-entities/client"
import { useSession } from "@supabase/auth-helpers-react"
import NotificationsContainer from "./notifications-card"
import { useLocale } from "next-intl"
import { useState } from "react"

export default function NotificationsPopover() {
    const session = useSession()
    const locale = useLocale()
    const { entities: notifications } = useEntities(session && "notifications", { lang: locale })
    const unreadNotifications = notifications?.filter((notification) => !notification.is_read)
    const { entity: metadata } = useEntity(session && "metadata", "me")
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Popover
            placement="bottom-end"
            isOpen={isOpen}
            onOpenChange={(open) => setIsOpen(open)}
            shouldBlockScroll
            backdrop="opaque"
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
                        content={unreadNotifications?.length}
                        isInvisible={!unreadNotifications?.length || !metadata?.notifications_badge_enabled}
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