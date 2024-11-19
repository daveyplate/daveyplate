import { Avatar, Badge, Button, Card, CardBody } from "@nextui-org/react"
import { cn } from "@nextui-org/react"
import { getLocaleValue } from "@daveyplate/supabase-swr-entities/client"
import { useLocale } from "next-intl"
import ReactTimeAgo from "react-time-ago"
import { getPathname, Link } from "@/i18n/routing"
import { useRouter } from "next/router"
import UserAvatar from "../user-avatar"
import { forwardRef } from "react"
import { TrashIcon } from "@heroicons/react/24/solid"

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

        const contentParts = localizedContent.split('{sender}')
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
                    "group w-full !min-h-fit flex gap-4 border-b border-divider px-6 py-4 items-center cursor-pointer",
                    !is_read ? "bg-primary-50" : "bg-content1",
                )}
                {...props}
                onClick={(e) => {
                    router.push(localeUrl, localeLinkAs)
                    setIsOpen(false)
                }}
            >
                <Button
                    as={Link}
                    href={sender ? `/user?user_id=${sender.id}` : url}
                    linkAs={sender ? `/user/${sender.id}` : link_as}
                    className="relative flex-none overflow-visible"
                    isIconOnly
                    radius="full"
                    disableRipple
                    onPress={() => setIsOpen(false)}
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
                        {contentParts.length > 1 ? (
                            <>
                                <span className="text-foreground/90">
                                    {contentParts[0]}
                                </span>
                                <Link
                                    href={`/user?user_id=${sender.id}`}
                                    linkAs={`/user/${sender.id}`}
                                    className="font-semibold"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setIsOpen(false)
                                    }}
                                >
                                    {sender.full_name}
                                </Link>
                                <span className="text-foreground/90">
                                    {contentParts[1]}
                                </span>
                            </>
                        ) : (
                            localizedContent
                        )}
                    </p>

                    <ReactTimeAgo date={new Date(created_at)} locale={locale} className="text-small text-default-400" />
                </div>

                <Button
                    className="ms-auto -me-1 hidden sm:flex opacity-0 group-hover:opacity-100"
                    variant="light"
                    radius="full"
                    disableRipple
                    isIconOnly
                >
                    <TrashIcon className="size-5" />
                </Button>
            </div>
        );
    },
);

NotificationItem.displayName = "NotificationItem";

export default NotificationItem;
