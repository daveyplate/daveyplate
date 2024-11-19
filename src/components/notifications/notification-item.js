import { Badge, Button } from "@nextui-org/react"
import { cn } from "@nextui-org/react"
import { getLocaleValue } from "@daveyplate/supabase-swr-entities/client"
import { useLocale } from "next-intl"
import ReactTimeAgo from "react-time-ago"
import { getPathname, Link } from "@/i18n/routing"
import { useRouter } from "next/router"
import UserAvatar from "../user-avatar"
import { forwardRef, useCallback, useRef } from "react"
import { TrashIcon } from "@heroicons/react/24/solid"
import { Avatar } from "@daveyplate/nextui-fixed-avatar"
import SwipeToDelete from "react-swipe-to-delete-ios"

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
        const localizedContent = getLocaleValue(content, locale)
        const contentParts = localizedContent.split('{sender}')
        const localeUrl = getPathname({ href: url, locale })
        const localeLinkAs = link_as && getPathname({ href: link_as, locale })
        const pointer = useRef({ x: 0, y: 0 })

        const onMouseDown = useCallback((e) => {
            pointer.current = { x: e.clientX, y: e.clientY }
        }, [])

        const onClick = useCallback((e) => {
            const { x, y } = pointer.current
            if (Math.abs(e.clientX - x) > 10 || Math.abs(e.clientY - y) > 10) return

            router.push(localeUrl, localeLinkAs)
            setIsOpen(false)
        }, [router, localeUrl, localeLinkAs])

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
        }

        return (
            <SwipeToDelete
                ref={ref}
                className={cn("!w-full !bg-danger", className)}
                onDelete={() => console.log("Deleted")}
                height="fit"
                deleteColor="transparent"
                deleteComponent={
                    <TrashIcon className="size-5 mx-auto" />
                }
            >
                <div
                    className={cn(
                        "group w-full !min-h-fit flex gap-4 border-b border-divider px-6 py-4 items-center cursor-pointer",
                        !is_read ? "bg-primary-50" : "bg-content1",
                    )}
                    {...props}
                    onMouseDown={onMouseDown}
                    onClick={onClick}
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
                        <p className="text-base text-foreground select-none">
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
            </SwipeToDelete>
        );
    },
);

NotificationItem.displayName = "NotificationItem";

export default NotificationItem;
