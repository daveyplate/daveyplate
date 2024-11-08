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

export default function Messages() {
    const session = useSession()
    const locale = useLocale()
    const { entity: user } = useEntity(session && 'profiles', 'me')

    const {
        entities: messages,
        createEntity: createMessage,
        deleteEntity: deleteMessage,
        mutateEntities: mutateMessages
    } = useEntities('messages', { limit: 20 })
    messages?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

    const { send: sendData, isOnline } = usePeers({
        enabled: !!session,
        onData: () => mutateMessages(),
        room: "chat"
    })

    const [content, setContent] = useState('')
    const [shouldScrollDown, setShouldScrollDown] = useState(true)
    const [prevScrollHeight, setPrevScrollHeight] = useState(null)
    const inputRef = useRef(null)

    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = document.scrollingElement

        if (scrollTop == 0) {
            console.log("scrollTop", scrollTop)
            // setVisibleMessagesCount(prevCount => prevCount + 10)
            setPrevScrollHeight(scrollHeight)
        }

        const isAtBottom = scrollTop + clientHeight >= scrollHeight

        setShouldScrollDown(isAtBottom)
    }

    useEffect(() => {
        document.addEventListener("scroll", handleScroll, true)

        return () => {
            document.removeEventListener("scroll", handleScroll, true)
        }
    }, [])

    useEffect(() => {
        // scroll to bottom
        if (shouldScrollDown) {
            window.scrollTo(0, document.body.scrollHeight)
        } else if (prevScrollHeight) {
            console.log("prevScrollHeight", prevScrollHeight)
            const { scrollTop, scrollHeight } = document.scrollingElement
            console.log("scrollTop", scrollTop)
            console.log("scrollHeight", scrollHeight)
            window.scrollTo(0, scrollTop + (scrollHeight - prevScrollHeight))

            setPrevScrollHeight(null)
        }
    }, [messages])

    const sendMessage = (e) => {
        e?.preventDefault()

        if (!content || !session) return

        setShouldScrollDown(true)

        const newMessage = {
            id: v4(),
            user_id: user.id,
            content,
            created_at: new Date()
        }

        createMessage(newMessage)
            .then(() => sendData("create_message"))

        mutateMessages([...messages, { ...newMessage, user }], false)

        setContent('')
    }

    return (
        <div className={cn(messages ? "opacity-1" : "opacity-0",
            "flex-container max-w-xl mx-auto justify-end !pb-16 transition-all"
        )}>
            {messages?.map((message) => (
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
                                    date={new Date(message.created_at)}
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
            ))}

            <div className="fixed bottom-16 mb-safe w-full left-0 flex bg-background/90 z-20 backdrop-blur">
                <form onSubmit={sendMessage} className="px-4 mx-auto w-full max-w-xl">
                    <Input
                        ref={inputRef}
                        autoFocus
                        size="lg"
                        variant="bordered"
                        placeholder={
                            session
                                ? "Type your message..."
                                : "Sign in to send messages"
                        }
                        value={content}
                        onValueChange={setContent}
                        isDisabled={!session}
                        autoComplete='off'
                        endContent={
                            <Button
                                size="sm"
                                color="primary"
                                isIconOnly
                                radius="full"
                                className="-me-1"
                                isDisabled={!content || !session}
                                onPressStart={() => sendMessage()}
                            >
                                <ArrowUpIcon className="size-4" />
                            </Button>
                        }
                    />
                </form>
            </div>
        </div>
    )
}

export async function getStaticProps({ locale, params }) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined