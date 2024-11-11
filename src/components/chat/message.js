import { memo, useEffect, useState } from 'react'
import { Button, Card, CardBody, Badge, AvatarGroup, cn, Divider, Textarea, Dropdown, DropdownMenu, DropdownItem, DropdownTrigger, DropdownSection } from "@nextui-org/react"
import { HeartIcon, PencilIcon, TrashIcon, UserIcon } from '@heroicons/react/24/solid'
import ReactTimeAgo from 'react-time-ago'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import Flag from 'react-flagpack'
import { getLocaleValue, useCreateEntity, useDeleteEntity, useEntity } from '@daveyplate/supabase-swr-entities/client'

import UserAvatar from '@/components/user-avatar'
import { toast } from '@/components/providers/toast-provider'
import { localeToCountry } from '../locale-dropdown'
import { Link } from "@/i18n/routing"
import { dynamicHref } from "@/utils/utils"

export default memo(({
    message,
    user,
    isOnline,
    mutateMessage,
    deleteMessage,
    sendData,
    updateMessage,
    shouldScrollDown
}) => {
    const locale = useLocale()
    const [isEditing, setIsEditing] = useState(false)
    const [editedContent, setEditedContent] = useState(getLocaleValue(message.content, locale))

    const isMessageLiked = (message) => message.likes?.find((like) => like.user_id == user?.id)
    const createEntity = useCreateEntity()
    const deleteEntity = useDeleteEntity()
    const translateMessage = message && !message.content[locale]
    const { entity: translatedMessage, isLoading: translationLoading } = useEntity(translateMessage ? "messages" : null, message.id, { lang: locale })
    message = translatedMessage || message

    const likeMessage = (message) => {
        const messageLike = { message_id: message.id, user_id: user.id }
        createEntity("message_likes", messageLike).then(({ error }) => {
            if (error) {
                toast(error.message, { color: "danger" })
                return mutateMessage({ ...message, likes: message.likes?.filter((like) => like.user_id != user.id) })
            }
            sendData({ action: "like_message", data: { message_id: message.id } })
        })
        mutateMessage({ ...message, likes: [...(message.likes || []), { ...messageLike, user }] })
    }

    const unlikeMessage = (message) => {
        const messageLike = message.likes?.find((like) => like.user_id == user.id)
        if (!messageLike) {
            toast("Message like not found", { color: "danger" })
            return
        }

        deleteEntity("message_likes", null, { message_id: message.id, user_id: user.id }).then(({ error }) => {
            if (error) {
                toast(error.message, { color: "danger" })
                return mutateMessage({ ...message, likes: [...(message.likes || []), messageLike] })
            }
            sendData({ action: "unlike_message", data: { message_id: message.id } })
        })

        mutateMessage({ ...message, likes: message.likes?.filter((like) => like.user_id != user.id) })
    }

    useEffect(() => {
        if (shouldScrollDown) {
            window.scrollTo(0, document.body.scrollHeight)
        }
    }, [isEditing])

    if (translationLoading) return null

    const localizedMessage = getLocaleValue(message.content, locale, message.locale)
    const originalMessage = getLocaleValue(message.content, message.locale)

    return (
        <div
            key={message.id}
            className={cn(
                "flex gap-3 w-full",
                message.user_id == user?.id && "flex-row-reverse"
            )}
        >
            <Dropdown>
                <DropdownTrigger>
                    <div className="mb-auto cursor-pointer">
                        <Badge
                            isOneChar
                            isInvisible={message.user_id != user?.id && !isOnline(message.user_id)}
                            color="success"
                            shape="circle"
                            placement="bottom-right"
                            size="sm"
                        >
                            <UserAvatar user={message.user} />
                        </Badge>
                    </div>
                </DropdownTrigger>

                <DropdownMenu itemClasses={{ title: "!text-base", base: "gap-3 px-3" }}>
                    <DropdownItem
                        as={Link}
                        href={dynamicHref({ pathname: `/user/[user_id]`, query: { user_id: message.user_id } })}
                        startContent={<UserIcon className="size-5" />}
                    >
                        View Profile
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>

            {isEditing ? (
                <div className="flex flex-col gap-2 w-64">
                    <Textarea
                        fullWidth
                        size="lg"
                        variant="bordered"
                        value={editedContent}
                        onValueChange={(value) => setEditedContent(value)}
                    />

                    <div className="flex gap-2">
                        <Button
                            size="lg"
                            color="primary"
                            onPress={async () => {
                                setIsEditing(false)
                                const { error } = await updateMessage(message, { content: { [locale]: editedContent } })
                                error && toast(error.message, { color: "danger" })
                            }}
                        >
                            Save
                        </Button>

                        <Button
                            size="lg"
                            onPress={() => setIsEditing(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            isIconOnly
                            color="danger"
                            size="lg"
                            onPress={async () => {
                                setIsEditing(false)
                                const { error } = await deleteMessage(message.id) || {}
                                error && toast(error.message, { color: "danger" })
                            }}
                        >
                            <TrashIcon className="size-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <Card className={cn("max-w-[70%]",
                        message.user_id == user?.id && "bg-primary text-primary-foreground"
                    )}>
                        <CardBody className="px-4 py-3 gap-2">
                            <div className="flex gap-4 items-center">
                                <h6>
                                    {message.user?.full_name || "Unnamed"}
                                </h6>

                                <ReactTimeAgo
                                    className={cn("ms-auto text-tiny font-light",
                                        message.user_id == user?.id ? "text-primary-foreground/60" : "text-foreground/60"
                                    )}
                                    date={new Date(message.created_at)}
                                    locale={locale}
                                    timeStyle="mini-minute-now"
                                />
                            </div>

                            <div className="flex justify-between gap-4">
                                <p className="font-light text-foreground-80">
                                    {localizedMessage}
                                </p>

                                {message.user_id == user?.id && (
                                    <Button
                                        size="sm"
                                        variant="light"
                                        isIconOnly
                                        radius="full"
                                        onPress={() => setIsEditing(true)}
                                        className="-me-2 -ms-1 -my-1 self-center"
                                    >
                                        <PencilIcon className="size-3 text-primary-foreground" />
                                    </Button>
                                )}
                            </div>

                            {localizedMessage != originalMessage && (
                                <>
                                    <Divider className={cn(message.user_id == user?.id && "invert dark:invert-0")} />

                                    <div className="flex justify-start gap-3">
                                        <Flag
                                            code={localeToCountry[message.locale]}
                                            gradient="real-linear"
                                            size="m"
                                            hasDropShadow
                                        />

                                        {message.user_id == user?.id ? (
                                            <Image alt="Google Translate" src="/logos/translated-by-google-white.svg" width={122} height={16} className="dark:hidden" />
                                        ) : (
                                            <Image alt="Google Translate" src="/logos/translated-by-google-color.svg" width={122} height={16} className="dark:hidden" />
                                        )}
                                        <Image alt="Google Translate" src="/logos/translated-by-google-white.svg" width={122} height={16} className="hidden dark:block" />
                                    </div>
                                </>
                            )}
                        </CardBody>
                    </Card>

                    <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        radius="full"
                        onPress={() => {
                            isMessageLiked(message)
                                ? unlikeMessage(message)
                                : likeMessage(message)
                        }}
                        className="-mx-1 self-center"
                        isDisabled={!user}
                    >
                        <HeartIcon
                            className={cn(isMessageLiked(message) ? "text-danger" : "text-default",
                                "size-5"
                            )}
                        />
                    </Button>

                    <AvatarGroup max={3} size="sm">
                        {message.likes?.map((like) => (
                            <UserAvatar key={like.user_id} user={like.user} size="sm" />
                        ))}
                    </AvatarGroup>
                </>
            )}

        </div>
    )
})