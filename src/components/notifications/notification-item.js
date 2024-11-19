import { Avatar, Badge, Button, Card, CardBody } from "@nextui-org/react"
import { cn } from "@nextui-org/react"
import { getLocaleValue } from "@daveyplate/supabase-swr-entities/client"
import { useLocale } from "next-intl"
import ReactTimeAgo from "react-time-ago"
import { getPathname } from "@/i18n/routing"
import { useRouter } from "next/router"
import UserAvatar from "../user-avatar"
import { forwardRef } from "react"

const NotificationItem = forwardRef(
    ({
        notification: {
            avatar_url,
            url,
            link_as,
            content,
            created_at,
            is_read,
            sender
        },
        setIsOpen,
        className,
        ...props
    }, ref) => {
        const router = useRouter()
        const locale = useLocale()
        let localizedContent = getLocaleValue(content, locale)
        const localeUrl = getPathname({ href: url, locale })
        const localeLinkAs = link_as && getPathname({ href: link_as, locale })

        // localizedContent can contain {sender} which is replaced with the sender's full name. Let's do that below, but make it dynamic. Like if it said sender.username it would do sender.username.

        localizedContent = localizedContent.replaceAll("{sender}", sender?.full_name)

        /**
         * Defines the content for different types of notifications.
         */
        const contentByType = {
            request: (
                <div className="flex gap-2 pt-2">
                    <Button color="primary">
                        Accept
                    </Button>

                    <Button variant="flat">
                        Decline
                    </Button>
                </div>
            )
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "flex gap-4 border-b border-divider px-6 py-4 items-center cursor-pointer",
                    !is_read && "bg-primary-50/50",
                )}
                {...props}
                onClick={(e) => {
                    router.push(localeUrl, localeLinkAs)
                    setIsOpen(false)
                }}
            >
                <Button
                    className="relative flex-none overflow-visible"
                    isIconOnly
                    radius="full"
                    disableRipple
                    onClick={(e) => {
                        if (!sender) return

                        e.stopPropagation()
                        router.push(`/user?user_id=${sender.id}`,
                            `/user/${sender.id}`)
                        setIsOpen(false)
                    }}
                >
                    <Badge
                        color="primary"
                        content=""
                        isInvisible={is_read}
                        placement="bottom-right"
                        shape="circle"
                    >
                        {sender ? (
                            <UserAvatar user={sender} />
                        ) : (
                            <Avatar src={avatar_url} />
                        )}
                    </Badge>
                </Button>

                <div className="flex flex-col gap-0.5">
                    <p className="text-base text-foreground">
                        {localizedContent}
                    </p>

                    <ReactTimeAgo date={new Date(created_at)} locale={locale} className="text-small text-default-400" />
                </div>
            </div>
        );
    },
);

NotificationItem.displayName = "NotificationItem";

export default NotificationItem;
