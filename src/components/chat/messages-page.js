import { useEffect, useRef, useState } from 'react'
import ReactTimeAgo from 'react-time-ago'
import { useLocale } from 'next-intl'
import { v4 } from 'uuid'
import { useSession } from '@supabase/auth-helpers-react'

import { useEntities, useEntity } from '@daveyplate/supabase-swr-entities/client'

import { Badge, Button, Card, CardBody, Input, cn } from "@nextui-org/react"
import { ArrowUpIcon, TrashIcon } from '@heroicons/react/24/solid'

import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { isExport } from "@/utils/utils"

import { usePeers } from '@/hooks/usePeers'
import UserAvatar from '@/components/user-avatar'

export default function MessagesPage({ user, isOnline, shouldScrollDown, page, prevScrollHeight, setPrevScrollHeight, setMessageCount, setMutateMessages, setCreateMessage, sendData, limit }) {
    const locale = useLocale()

    const {
        entities: messages,
        createEntity: createMessage,
        deleteEntity: deleteMessage,
        mutateEntities: mutateMessages,
        count
    } = useEntities('messages', { limit, offset: page * limit })
    // messages?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    const scrolled = useRef(false)

    useEffect(() => {
        if (!messages) return
        setMessageCount(count)

        if (page == 0) {
            setCreateMessage(() => (message) => {
                createMessage(message)
                mutateMessages([{ ...message, user }, ...messages], false)
            })

            setMutateMessages(() => mutateMessages)
        }

        // scroll to bottom
        if (shouldScrollDown) {
            window.scrollTo(0, document.body.scrollHeight)
        } else if (prevScrollHeight && !scrolled.current) {
            scrolled.current = true
            const { scrollTop, scrollHeight } = document.scrollingElement
            window.scrollTo(0, scrollTop + (scrollHeight - prevScrollHeight), { behavior: 'smooth' })

            setPrevScrollHeight(null)
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