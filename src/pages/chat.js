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

function MessagesPage({ user, isOnline, shouldScrollDown, page, prevScrollHeight, setPrevScrollHeight, setMessageCount, setMutateMessages, setCreateMessage, sendData, limit }) {
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

export default function Chat() {
    const session = useSession()
    const [pageCount, setPageCount] = useState(1)
    const [messageCount, setMessageCount] = useState(0)
    const [mutateMessages, setMutateMessages] = useState(null)
    const [createMessage, setCreateMessage] = useState(null)
    const pageLimit = 100
    const { entity: user } = useEntity(session && 'profiles', 'me')

    const { send: sendData, isOnline } = usePeers({
        enabled: !!session,
        onData: () => mutateMessages && mutateMessages(),
        room: "chat"
    })

    const [content, setContent] = useState('')
    const [shouldScrollDown, setShouldScrollDown] = useState(true)
    const [prevScrollHeight, setPrevScrollHeight] = useState(null)

    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = document.scrollingElement

        if (scrollTop == 0) {
            setPrevScrollHeight(scrollHeight)

            if (messageCount > pageCount * pageLimit) {
                setPageCount(prevCount => prevCount + 1)
            }
        }

        const isAtBottom = scrollTop + clientHeight >= scrollHeight

        setShouldScrollDown(isAtBottom)
    }

    useEffect(() => {
        document.addEventListener("scroll", handleScroll, true)

        return () => {
            document.removeEventListener("scroll", handleScroll, true)
        }
    }, [messageCount, pageCount, pageLimit])

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
        sendData("create_message")

        setContent('')
    }

    useEffect(() => {
        console.log(createMessage)
    }, [createMessage])

    return (
        <div className={cn(
            "flex-container max-w-xl mx-auto justify-end !pb-16 transition-all"
        )}>
            <div className="flex flex-col gap-4 w-full flex-col-reverse">
                {[...Array(pageCount).keys()].map((page) => (
                    <MessagesPage
                        key={page}
                        page={page}
                        user={user}
                        isOnline={isOnline}
                        shouldScrollDown={shouldScrollDown}
                        prevScrollHeight={prevScrollHeight}
                        setPrevScrollHeight={setPrevScrollHeight}
                        setMessageCount={setMessageCount}
                        setMutateMessages={setMutateMessages}
                        setCreateMessage={setCreateMessage}
                        sendData={sendData}
                        limit={pageLimit}
                    />
                ))}
            </div>
            <div className="fixed bottom-16 mb-safe w-full left-0 flex bg-background/90 z-20 backdrop-blur">
                <form onSubmit={sendMessage} className="px-4 mx-auto w-full max-w-xl">
                    <Input
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