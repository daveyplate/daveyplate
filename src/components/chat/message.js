
import { useEffect } from 'react'
import ReactTimeAgo from 'react-time-ago'
import { useLocale } from 'next-intl'

import { getLocaleValue, useCreateEntity, useDeleteEntity, useEntities } from '@daveyplate/supabase-swr-entities/client'

import { AvatarGroup, Badge, Button, Card, CardBody, cn } from "@nextui-org/react"
import { HeartIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid'

import UserAvatar from '@/components/user-avatar'
import { toast } from '@/components/providers/toast-provider'

export default function Message({ message, user, isOnline }) {
    const locale = useLocale()
    const isMessageLiked = (message) => message.likes?.find((like) => like.user_id == user?.id)

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
}