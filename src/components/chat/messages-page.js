import { useEffect } from 'react'
import ReactTimeAgo from 'react-time-ago'
import { useLocale } from 'next-intl'

import { useEntities } from '@daveyplate/supabase-swr-entities/client'

import { Badge, Button, Card, CardBody, Input, cn } from "@nextui-org/react"
import { TrashIcon } from '@heroicons/react/24/solid'

import UserAvatar from '@/components/user-avatar'

export default function MessagesPage({ user, isOnline, shouldScrollDown, page, prevScrollHeight, setMessageCount, setMutateMessages, setCreateMessage, sendData, limit }) {
    const locale = useLocale()

    const {
        entities: messages,
        createEntity: createMessage,
        deleteEntity: deleteMessage,
        mutateEntities: mutateMessages,
        count
    } = useEntities('messages', { limit, offset: page * limit })
    // messages?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    useEffect(() => {
        if (!messages) return
        setMessageCount(count)

        if (page == 0) {
            setCreateMessage(() => (message) => {
                createMessage(message).then(() => sendData("create_message"))
                mutateMessages([{ ...message, user }, ...messages], false)
            })

            setMutateMessages(() => mutateMessages)
        }

        // scroll to bottom
        if (shouldScrollDown) {
            window.scrollTo(0, document.body.scrollHeight)
        } else if (prevScrollHeight.current) {
            const { scrollTop, scrollHeight } = document.scrollingElement
            window.scrollTo(0, scrollTop + (scrollHeight - prevScrollHeight.current))
            prevScrollHeight.current = null
        }
    }, [messages, shouldScrollDown])

    return (
        messages?.map((message) => (
            <div
                key={message.id}
                className={cn(
                    "flex gap-3 w-full",
                    message.user_id === user?.id && "flex-row-reverse"
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
                    message.user_id === user?.id && "bg-primary text-primary-foreground"
                )}>
                    <CardBody className="px-4 py-3 gap-2">
                        <div className="flex gap-4 items-center">
                            <h6>
                                {message.user?.full_name || "Unnamed"}
                            </h6>

                            <ReactTimeAgo
                                className={cn("ms-auto text-tiny font-light",
                                    message.user_id === user?.id ? "text-primary-foreground/60" : "text-foreground/60"
                                )}
                                date={new Date()}
                                locale={locale}
                                timeStyle="mini-minute-now"
                            />
                        </div>

                        <p className="font-light text-foreground-80">
                            {message.content}
                        </p>
                    </CardBody>
                </Card>

                {message.user_id === user?.id && (
                    <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        radius="full"
                        onPress={() => {
                            deleteMessage(message.id)
                                .then(() => sendData("delete_message"))
                        }}
                        className="-mx-1 self-center"
                    >
                        <TrashIcon className="size-4" />
                    </Button>
                )}
            </div>
        ))
    )
}