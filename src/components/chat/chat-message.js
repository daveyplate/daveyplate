import { useSession } from '@supabase/auth-helpers-react'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { memo, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { getLocaleValue, useCreateEntity, useDeleteEntity } from '@daveyplate/supabase-swr-entities/client'
import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'

import { ArrowRightIcon, ChatBubbleOvalLeftIcon, HeartIcon, PencilIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline'
import { AvatarGroup, Button, cn, Divider, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Textarea } from "@nextui-org/react"
import Flag from 'react-flagpack'
import ReactTimeAgo from 'react-time-ago'

import UserAvatar from '@/components/user-avatar'
import { getPathname } from "@/i18n/routing"
import { localeToCountry } from '../locale-dropdown'

export default memo(({
    message,
    user,
    mutateMessage,
    deleteMessage,
    sendData,
    sendWhisperData,
    updateMessage,
    setWhisperUser
}) => {
    const router = useRouter()
    const session = useSession()
    const locale = useLocale()
    const { autoTranslate } = useAutoTranslate("message")
    const isWhisper = !!message.recipient_id
    const isOutgoing = message.user_id == session?.user.id
    const [isEditing, setIsEditing] = useState(false)
    const [editedContent, setEditedContent] = useState(getLocaleValue(message.content, locale))
    const messageRef = useRef(null)

    const isMessageLiked = (message) => message.likes?.find((like) => like.user_id == user?.id)
    const createEntity = useCreateEntity()
    const deleteEntity = useDeleteEntity()

    const likeMessage = (message) => {
        const messageLike = { message_id: message.id, user_id: user.id }
        createEntity("message_likes", messageLike).then(({ error }) => {
            if (error) {
                return mutateMessage({ ...message, likes: message.likes?.filter((like) => like.user_id != user.id) })
            }

            !error && sendData && sendData({ event: "like_message" })
        })

        mutateMessage({ ...message, likes: [...(message.likes || []), { ...messageLike, user }] })
    }

    const unlikeMessage = (message) => {
        const messageLike = message.likes?.find((like) => like.user_id == user.id)
        if (!messageLike) {
            toast.error("Message like not found")
            return
        }

        deleteEntity("message_likes", null, { message_id: message.id, user_id: user.id }).then(({ error }) => {
            if (error) {
                return mutateMessage({ ...message, likes: [...(message.likes || []), messageLike] })
            }

            !error && sendData && sendData({ event: "like_message" })
        })

        mutateMessage({ ...message, likes: message.likes?.filter((like) => like.user_id != user.id) })
    }

    useEffect(() => {
        if (isEditing) {
            messageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        }
    }, [isEditing])

    const localizedMessage = getLocaleValue(message.content, locale, message.locale)
    const originalMessage = getLocaleValue(message.content, message.locale)

    return (
        <div
            ref={messageRef}
            className={cn("flex gap-3", { "flex-row-reverse": isOutgoing })}
        >
            <Dropdown className="min-w-0">
                <DropdownTrigger>
                    <Button isIconOnly radius="full">
                        <UserAvatar user={message.user} />
                    </Button>
                </DropdownTrigger>

                <DropdownMenu>
                    <DropdownItem
                        onPress={() => router.push(getPathname({
                            href: `/user?user_id=${message.user_id}`, locale
                        }), getPathname({
                            href: `/user/${message.user_id}`, locale
                        }))}
                        startContent={<UserIcon className="size-5" />}
                    >
                        {autoTranslate('view_profile', 'View Profile')}
                    </DropdownItem>

                    {message.user_id !== user?.id && (
                        <DropdownItem
                            key="whisper"
                            color="secondary"
                            startContent={<ChatBubbleOvalLeftIcon className="size-5" />}
                            onPress={() => setTimeout(() => setWhisperUser(message.user), 200)}
                        >
                            {autoTranslate('whisper', 'Whisper')}
                        </DropdownItem>
                    )}
                </DropdownMenu>
            </Dropdown>

            <div className="flex max-w-[70%] flex-col gap-4">
                {isEditing ? (
                    <div className="flex flex-col gap-2">
                        <Textarea
                            fullWidth
                            variant="bordered"
                            value={editedContent}
                            onValueChange={(value) => setEditedContent(value)}
                            autoFocus
                        />

                        <div className="flex gap-2">
                            <Button
                                color="primary"
                                onPress={async () => {
                                    setIsEditing(false)
                                    const { error } = await updateMessage(message.id, { content: { [locale]: editedContent } })
                                    isWhisper && !error && sendWhisperData({ event: "update_entity" })
                                }}
                            >
                                <AutoTranslate tKey="save">
                                    Save
                                </AutoTranslate>
                            </Button>

                            <Button onPress={() => setIsEditing(false)} variant="light">
                                <AutoTranslate tKey="cancel">
                                    Cancel
                                </AutoTranslate>
                            </Button>

                            <Button
                                isIconOnly
                                color="danger"
                                onPress={async () => {
                                    setIsEditing(false)
                                    const { error } = await deleteMessage(message.id) || {}

                                    if (isWhisper && !error) {
                                        sendWhisperData({ event: "delete_entity" })
                                    }
                                }}
                                variant="flat"
                            >
                                <TrashIcon className="size-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        className={cn(
                            "flex flex-col relative w-full rounded-medium px-4 py-3 gap-2",
                            isWhisper ? "bg-secondary text-secondary-foreground" :
                                isOutgoing ? "bg-primary text-primary-foreground" : "bg-content2 text-default-900"
                        )}
                    >
                        <div className="flex gap-3">
                            <div className="w-full text-small font-semibold">
                                {message.user?.full_name || "Unnamed"}

                                {isWhisper && (
                                    <span className="ms-1.5 font-normal text-tiny text-primary-foreground/90">
                                        {autoTranslate('whispered', 'whispered')}
                                    </span>
                                )}
                            </div>

                            <ReactTimeAgo
                                className={cn("flex-end text-small flex-shrink-0",
                                    (isOutgoing || isWhisper) ? "text-primary-foreground/50" : "text-default-400"
                                )}
                                date={new Date(message.created_at)}
                                locale={locale}
                                timeStyle="mini-minute-now"
                            />
                        </div>

                        {message.recipient_id && (
                            <div className="flex items-center gap-2 text-small">
                                <ArrowRightIcon className="size-4 -mx-1" />

                                <UserAvatar user={isOutgoing ? message.recipient : user} size="sm" className="ms-1 w-6 h-6" />

                                {message.recipient?.full_name || (!isOutgoing && user?.full_name)}
                            </div>
                        )}

                        <div className="text-small flex justify-between gap-2">
                            <div className="whitespace-pre-line">
                                {localizedMessage}
                            </div>

                            {message.user_id == user?.id && (
                                <Button
                                    size="sm"
                                    variant="light"
                                    isIconOnly
                                    radius="full"
                                    onPress={() => setIsEditing(true)}
                                    className="-me-2 -ms-1 -my-1 self-center"
                                >
                                    <PencilIcon className="size-3 text-primary-foreground/60" />
                                </Button>
                            )}
                        </div>

                        {localizedMessage != originalMessage && (
                            <>
                                <Divider className={cn((isOutgoing || isWhisper) && "light:invert")} />

                                <div className="flex justify-start items-center gap-3">
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
                    </div>
                )}
            </div>

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
                    onPress={() => {
                        isMessageLiked(message) ?
                            unlikeMessage(message) :
                            likeMessage(message)
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