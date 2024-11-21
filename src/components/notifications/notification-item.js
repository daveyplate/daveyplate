import { Badge, Button, Link as NextUILink } from "@nextui-org/react"
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
import { toast } from "sonner"

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
        disableSwipe,
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
            setIsOpen && setIsOpen(false)
            toast.dismiss()
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
                className={cn(disableSwipe ? "!bg-transparent" : "!bg-danger")}
                onDelete={() => console.log("Deleted")}
                height="fit"
                deleteColor="transparent"
                deleteComponent={
                    <TrashIcon className="size-5 mx-auto" />
                }
                disabled={disableSwipe}
            >
                <div
                    className={cn(
                        "group flex gap-4 border-b border-divider px-6 py-4 cursor-pointer select-none",
                        !is_read ? "bg-primary-50" : "bg-content1", className,
                    )}
                    {...props}
                    onMouseDown={onMouseDown}
                    onClick={onClick}
                >
                    <Link
                        href={sender ? `/user?user_id=${sender.id}` : url}
                        as={sender ? `/user/${sender.id}` : link_as}
                        legacyBehavior
                    >
                        <Button
                            className="overflow-visible mt-1"
                            disableRipple
                            isIconOnly
                            radius="full"
                            onPress={() => {
                                setIsOpen && setIsOpen(false)
                                toast.dismiss()
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
                    </Link>

                    <div className="flex flex-col gap-0.5 sm:-me-2">
                        <p>
                            {contentParts.length > 1 ? (
                                <>
                                    <span className="text-foreground/90">
                                        {contentParts[0]}
                                    </span>

                                    <Link
                                        href={`/user?user_id=${sender.id}`}
                                        as={`/user/${sender.id}`}
                                        legacyBehavior
                                    >
                                        <NextUILink
                                            className="font-semibold text-foreground"
                                            onPress={() => {
                                                setIsOpen && setIsOpen(false)
                                                toast.dismiss()
                                            }}
                                        >
                                            {sender.full_name}
                                        </NextUILink>
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
                        className={cn("ms-auto -me-1 hidden opacity-0 group-hover:opacity-100 my-auto", !disableSwipe && "sm:flex")}
                        variant="light"
                        radius="full"
                        disableRipple
                        isIconOnly
                    >
                        <TrashIcon className="size-5" />
                    </Button>
                </div>
            </SwipeToDelete>
        )
    }
)

NotificationItem.displayName = "NotificationItem"

export default NotificationItem
