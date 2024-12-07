import { useLocale } from "next-intl"
import { useRouter } from "next/router"
import { forwardRef, useCallback, useRef } from "react"
import { toast } from "sonner"

import { getLocaleValue } from "@daveyplate/supabase-swr-entities/client"

import { TrashIcon } from "@heroicons/react/24/outline"
import { Avatar, Badge, Button, cn, Link as NextUILink } from "@nextui-org/react"
import SwipeToDelete from "react-swipe-to-delete-ios"
import ReactTimeAgo from "react-time-ago"

import { getPathname, Link } from "@/i18n/routing"

import UserAvatar from "@/components/user-avatar"

const NotificationItem = forwardRef(
    ({
        notification: {
            id: notification_id,
            avatar_url,
            url,
            url_as,
            content,
            created_at,
            is_read,
            is_seen,
            sender
        },
        setIsOpen,
        className,
        disableSwipe,
        updateNotification,
        deleteNotification,
        ...props
    }, ref) => {
        const router = useRouter()
        const locale = useLocale()
        const localizedContent = getLocaleValue(content, locale)
        const contentParts = localizedContent.split('{sender}')
        const localeUrl = getPathname({ href: url, locale })
        const localeLinkAs = url_as && getPathname({ href: url_as, locale })
        const pointer = useRef({ x: 0, y: 0 })

        const onMouseDown = useCallback((e) => {
            pointer.current = { x: e.clientX, y: e.clientY }
        }, [])

        const onClick = useCallback((e) => {
            const { x, y } = pointer.current
            if (Math.abs(e.clientX - x) > 10 || Math.abs(e.clientY - y) > 10) return

            router.push(localeUrl, localeLinkAs)
            notificationPressed()
        }, [router, localeUrl, localeLinkAs])

        const notificationPressed = useCallback(() => {
            toast.dismiss()
            setIsOpen && setIsOpen(false)

            if (!is_read || !is_seen) {
                updateNotification(notification_id, { is_read: true, is_seen: true })
            }
        }, [updateNotification, setIsOpen])

        /**
         * Defines the content for different types of notifications.
         */
        const contentByType = {
            request: (
                <div className="flex gap-2 pt-2">
                    <Button color="primary" size="sm">
                        Accept
                    </Button>

                    <Button size="sm" variant="flat">
                        Decline
                    </Button>
                </div>
            )
        }

        return (
            <SwipeToDelete
                ref={ref}
                className={cn(disableSwipe ? "!bg-transparent" : "!bg-danger")}
                onDelete={() => deleteNotification(notification_id)}
                height="fit"
                deleteColor="transparent"
                deleteComponent={
                    <TrashIcon className="size-4 mx-auto" />
                }
                disabled={disableSwipe}
            >
                <div
                    className={cn(
                        "group flex gap-3 border-b border-divider px-6 py-4 cursor-pointer select-none",
                        !is_read ? "bg-primary-50" : "bg-content1", className,
                    )}
                    {...props}
                    onMouseDown={onMouseDown}
                    onClick={onClick}
                >
                    <Link
                        href={sender ? `/user?user_id=${sender.id}` : url}
                        as={sender ? `/user/${sender.id}` : url_as}
                        legacyBehavior
                    >
                        <Button
                            className="overflow-visible"
                            disableRipple
                            isIconOnly
                            radius="full"
                            onPress={notificationPressed}
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
                    </Link>

                    <div className="flex flex-col gap-1">
                        <p className="text-small text-foreground">
                            {contentParts.length > 1 ? (
                                <>
                                    <span>
                                        {contentParts[0]}
                                    </span>

                                    <Link
                                        href={`/user?user_id=${sender.id}`}
                                        as={`/user/${sender.id}`}
                                        legacyBehavior
                                    >
                                        <NextUILink
                                            className="text-small font-medium text-foreground"
                                            onPress={notificationPressed}
                                        >
                                            {sender.full_name}
                                        </NextUILink>
                                    </Link>

                                    <span>
                                        {contentParts[1]}
                                    </span>
                                </>
                            ) : (
                                localizedContent
                            )}
                        </p>

                        <ReactTimeAgo
                            date={new Date(created_at)}
                            locale={locale}
                            className="text-tiny text-default-400"
                        />
                    </div>

                    <Button
                        className={cn("ms-auto -me-1 hidden opacity-0 group-hover:opacity-100 my-auto", !disableSwipe && "sm:flex")}
                        variant="light"
                        radius="full"
                        disableRipple
                        isIconOnly
                        onPress={() => {
                            console.log("delete")
                            deleteNotification(notification_id)
                        }}
                    >
                        <TrashIcon className="size-4" />
                    </Button>
                </div>
            </SwipeToDelete>
        )
    }
)

export default NotificationItem
