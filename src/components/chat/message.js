
import { memo } from 'react'
import ReactTimeAgo from 'react-time-ago'
import { useLocale } from 'next-intl'

import { getLocaleValue, useCreateEntity, useDeleteEntity, useEntity } from '@daveyplate/supabase-swr-entities/client'

import { AvatarGroup, Badge, Button, Card, CardBody, cn, Divider } from "@nextui-org/react"
import { HeartIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid'

import UserAvatar from '@/components/user-avatar'
import { toast } from '@/components/providers/toast-provider'
import Image from 'next/image'
import Flag from 'react-flagpack'
import { localeToCountry } from '../locale-dropdown'

export default memo(({
    message,
    user,
    isOnline,
    mutateMessage,
    deleteMessage,
    sendData
}) => {
    const locale = useLocale()
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
            <div>
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
                                onPress={() => {
                                    deleteMessage(message.id)
                                        .then(() => sendData({ action: "delete_message", data: { id: message.id } }))
                                }}
                                className="-me-2 -ms-1 -my-1 self-center"
                            >
                                <TrashIcon className="size-3 text-primary-foreground" />
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

            {false ? (
                <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    radius="full"
                    onPress={() => {
                        deleteMessage(message.id)
                            .then(() => sendData({ action: "delete_message", data: { id: message.id } }))
                    }}
                    className="-mx-1 self-center"
                >
                    <TrashIcon className="size-4" />
                </Button>
            ) : (
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
            )}

            <AvatarGroup max={3} size="sm">
                {message.likes?.map((like) => (
                    <UserAvatar key={like.user_id} user={like.user} size="sm" />
                ))}
            </AvatarGroup>
        </div>
    )
})