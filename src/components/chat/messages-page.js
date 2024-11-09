
import { useEffect } from 'react'
import ReactTimeAgo from 'react-time-ago'
import { useLocale } from 'next-intl'

import { getLocaleValue, useCreateEntity, useDeleteEntity, useEntities } from '@daveyplate/supabase-swr-entities/client'

import { AvatarGroup, Badge, Button, Card, CardBody, cn } from "@nextui-org/react"
import { HeartIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid'

import UserAvatar from '@/components/user-avatar'
import { toast } from '@/components/providers/toast-provider'

export default function MessagesPage({
    user,
    isOnline,
    shouldScrollDown,
    page,
    prevScrollHeight,
    setMessageCount,
    setCreateMessage,
    onDataCallbacks,
    sendData,
    limit
}) {
    const locale = useLocale()

    const {
        entities: messages,
        createEntity: createMessage,
        deleteEntity: deleteMessage,
        mutateEntities: mutateMessages,
        count
    } = useEntities('messages', { limit, offset: page * limit, lang: locale })
    const createEntity = useCreateEntity()
    const deleteEntity = useDeleteEntity()

    const onData = (data, _, peer) => {
        switch (data.action) {
            case "like_message": {
                const message = messages.find((message) => message.id == data.data.message_id)
                if (!message) return

                mutateMessage({ ...message, likes: [...message.likes, { user_id: peer.user_id, user: peer.user }] })
                break
            }
            case "unlike_message": {
                const message = messages.find((message) => message.id == data.data.message_id)
                if (!message) return

                mutateMessage({ ...message, likes: message.likes.filter((like) => like.user_id != peer.user_id) })
                break
            }
            case "delete_message": {
                const { id } = data.data

                mutateMessages(messages.filter((message) => message.id != id || message.user_id != peer.user_id), false)
                break
            }
            case "create_message": {
                const message = data.data
                if (!message) return

                // Don't allow invalid messages from invalid peers
                if (message.user_id != peer.user_id) return

                mutateMessages([{ ...message, user: peer.user }, ...messages], false)
                break
            }
        }
    }

    const isMessageLiked = (message) => message.likes?.find((like) => like.user_id == user.id)

    const likeMessage = (message) => {
        const messageLike = { message_id: message.id, user_id: user.id }
        createEntity("message_likes", messageLike).then(({ error }) => {
            if (error) {
                toast(error.message, { color: "danger" })
                return mutateMessage({ ...message, likes: message.likes.filter((like) => like.user_id != user.id) })
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

        mutateMessage({ ...message, likes: message.likes.filter((like) => like.user_id != user.id) })
    }

    const mutateMessage = (message) => {
        const newMessages = messages.map((m) => m.id == message.id ? { ...m, ...message } : m)
        mutateMessages(newMessages, false)
    }

    useEffect(() => {
        if (!messages) return

        onDataCallbacks.current[page] = onData

        setMessageCount(count)

        if (page == 0) {
            setCreateMessage(() => (message) => {
                createMessage(message).then(() => sendData({ action: "create_message", data: message }))
                mutateMessages([{ ...message, user }, ...messages], false)
            })
        }

        if (shouldScrollDown) {
            window.scrollTo(0, document.body.scrollHeight)
        } else if (prevScrollHeight.current) {
            const { scrollTop, scrollHeight } = document.scrollingElement
            window.scrollTo(0, scrollTop + (scrollHeight - prevScrollHeight.current))
            prevScrollHeight.current = null
        }

        return () => {
            delete onDataCallbacks.current[page]
        }
    }, [messages, shouldScrollDown])

    return (
        messages?.map((message) => (
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
                                {getLocaleValue(message.content, locale, message.locale)}
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
        ))
    )
}