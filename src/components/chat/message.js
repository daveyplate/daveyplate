import { memo, useEffect, useState } from 'react'
import { Button, Card, CardBody, Badge, AvatarGroup, cn, Divider, Textarea, Dropdown, DropdownMenu, DropdownItem, DropdownTrigger } from "@nextui-org/react"
import { ArrowRightIcon, ChatBubbleOvalLeftIcon, HeartIcon, PencilIcon, TrashIcon, UserIcon } from '@heroicons/react/24/solid'
import ReactTimeAgo from 'react-time-ago'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import Flag from 'react-flagpack'
import { getLocaleValue, useCreateEntity, useDeleteEntity } from '@daveyplate/supabase-swr-entities/client'
import { useAutoTranslate } from 'next-auto-translate'

import UserAvatar from '@/components/user-avatar'
import { toast } from '@/components/providers/toast-provider'
import { localeToCountry } from '../locale-dropdown'
import { Link } from "@/i18n/routing"
import { useSession } from '@supabase/auth-helpers-react'

export default memo(({
    message,
    user,
    isOnline,
    mutateMessage,
    deleteMessage,
    sendData,
    sendWhisperData,
    updateMessage,
    setWhisperUser
}) => {
    const session = useSession()
    const locale = useLocale()
    const { autoTranslate } = useAutoTranslate("message")
    const isWhisper = !!message.recipient_id
    const isOutgoing = message.user_id == session?.user.id
    const [isEditing, setIsEditing] = useState(false)
    const [editedContent, setEditedContent] = useState(getLocaleValue(message.content, locale))

    const isMessageLiked = (message) => message.likes?.find((like) => like.user_id == user?.id)
    const createEntity = useCreateEntity()
    const deleteEntity = useDeleteEntity()

    const likeMessage = (message) => {
        const messageLike = { message_id: message.id, user_id: user.id }
        createEntity("message_likes", messageLike).then(({ error }) => {
            if (error) {
                return mutateMessage({ ...message, likes: message.likes?.filter((like) => like.user_id != user.id) })
            }

            !error && sendData && sendData({ action: "like_message" })
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
                return mutateMessage({ ...message, likes: [...(message.likes || []), messageLike] })
            }

            !error && sendData && sendData({ action: "like_message" })
        })

        mutateMessage({ ...message, likes: message.likes?.filter((like) => like.user_id != user.id) })
    }

    useEffect(() => {
        if (isEditing) {
            const distanceToBottom = document.body.scrollHeight - window.scrollY - window.innerHeight

            if (distanceToBottom < 200) {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
            }
        }
    }, [isEditing])

    const localizedMessage = getLocaleValue(message.content, locale, message.locale)
    const originalMessage = getLocaleValue(message.content, message.locale)

    return (
        <div
            key={message.id}
            className={cn(
                "flex gap-3 w-full",
                isOutgoing && "flex-row-reverse"
            )}
        >
            <Dropdown>
                <DropdownTrigger>
                    <div className="mb-auto cursor-pointer">
                        <Badge
                            isOneChar
                            isInvisible={!isOutgoing && (!isOnline || !isOnline(message.user_id))}
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
                        href={`/user?user_id=${message.user_id}`}
                        linkAs={`/user/${message.user_id}`}
                        startContent={<UserIcon className="size-5" />}
                    >
                        {autoTranslate('view_profile', 'View Profile')}
                    </DropdownItem>

                    {message.user_id !== user?.id && (
                        <DropdownItem
                            key="whisper"
                            startContent={<ChatBubbleOvalLeftIcon className="size-5" />}
                            onPress={() => setTimeout(() => setWhisperUser(message.user), 200)}
                        >
                            {autoTranslate('whisper', 'Whisper')}
                        </DropdownItem>
                    )}
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
                                const { error } = await updateMessage(message.id, { content: { [locale]: editedContent } })
                                error && toast(error.message, { color: "danger" })
                                isWhisper && !error && sendWhisperData({ action: "update_entity" })
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
                                isWhisper && !error && sendWhisperData({ action: "delete_entity" })
                            }}
                        >
                            <TrashIcon className="size-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <Card className={cn("max-w-[70%]",
                        isWhisper ? "bg-secondary text-secondary-foreground" :
                            isOutgoing && "bg-primary text-primary-foreground"
                    )}>
                        <CardBody className="px-4 py-3 gap-2">
                            <div className="flex gap-4 items-center">
                                <h6>
                                    {message.user?.full_name || "Unnamed"}
                                </h6>

                                <ReactTimeAgo
                                    className={cn("ms-auto text-tiny font-light",
                                        (isOutgoing || isWhisper) ? "text-primary-foreground/60" : "text-foreground/60"
                                    )}
                                    date={new Date(message.created_at)}
                                    locale={locale}
                                    timeStyle="mini-minute-now"
                                />
                            </div>

                            {message.recipient_id && (
                                <div className="flex items-center gap-2">
                                    <ArrowRightIcon className="size-4 -mx-1" />

                                    <UserAvatar user={isOutgoing ? message.recipient : user} size="sm" className="ms-1 w-6 h-6" />

                                    {message.recipient?.full_name || (!isOutgoing && user?.full_name)}
                                </div>
                            )}

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
                                    <Divider className={cn((isOutgoing || isWhisper) && "invert dark:invert-0")} />

                                    <div className="flex justify-start gap-3">
                                        <Flag
                                            code={localeToCountry[message.locale]}
                                            gradient="real-linear"
                                            size="m"
                                            hasDropShadow
                                        />

                                        {(isOutgoing || isWhisper) ? (
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

                    {isWhisper ? !isOutgoing && (
                        <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            radius="full"
                            onPress={() => setWhisperUser(message.user)}
                            className="-mx-1 self-center"
                            isDisabled={!user}
                        >
                            <ChatBubbleOvalLeftIcon
                                className="size-5 text-default"
                            />
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            radius="full"
                            onPress={
                                () => {
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
                </>
            )}
        </div>
    )
})