import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { v4 } from 'uuid'
import { useSession } from '@supabase/auth-helpers-react'

import { useEntity, useInfiniteEntities } from '@daveyplate/supabase-swr-entities/client'

import { Button, Input, cn } from "@nextui-org/react"
import { ArrowUpIcon } from '@heroicons/react/24/solid'

import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { isExport } from "@/utils/utils"

import { usePeers } from '@/hooks/usePeers'
import Message from '@/components/chat/message'

export default function Chat() {
    const session = useSession()
    const locale = useLocale()
    const { entity: user } = useEntity(session && 'profiles', 'me')

    const {
        entities: messages,
        isValidating: messagesValidating,
        size,
        setSize,
        hasMore,
        createEntity: createMessage,
        deleteEntity: deleteMessage,
        insertEntity: insertMessage,
        mutateEntity: mutateMessage,
        removeEntity: removeMessage
    } = useInfiniteEntities("messages", { lang: locale, limit: 10 })
    messages?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    const [content, setContent] = useState('')
    const [shouldScrollDown, setShouldScrollDown] = useState(true)
    const prevScrollHeight = useRef(null)
    const prevScrollTop = useRef(null)

    const onData = (data, connection) => {
        const peer = getPeer(connection)
        if (!peer) return

        switch (data.action) {
            case "like_message": {
                const message = messages.find((message) => message.id == data.data.message_id)
                if (!message) return

                mutateMessage({ ...message, likes: [...(message.likes || []), { user_id: peer.user_id, user: peer.user }] })
                break
            }
            case "unlike_message": {
                const message = messages.find((message) => message.id == data.data.message_id)
                if (!message) return

                mutateMessage({ ...message, likes: message.likes?.filter((like) => like.user_id != peer.user_id) })
                break
            }
            case "delete_message": {
                const { id } = data.data
                const message = messages.find((message) => message.id == id)
                if (message?.user_id != peer.user_id) return

                removeMessage(id)
                break
            }
            case "create_message": {
                const message = data.data
                if (!message) return

                // Don't allow invalid messages from invalid peers
                if (message.user_id != peer.user_id) return

                insertMessage({ ...message, user: peer.user })
                break
            }
        }
    }

    const { sendData, isOnline, getPeer } = usePeers({
        enabled: !!session,
        onData,
        room: "chat"
    })

    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = document.scrollingElement
        prevScrollTop.current = scrollTop

        if (scrollTop < 512) {
            prevScrollHeight.current = scrollHeight

            if (hasMore && !messagesValidating) {
                setSize(size + 1)
            }
        }

        const isAtBottom = scrollTop + clientHeight >= scrollHeight
        setShouldScrollDown(isAtBottom)
    }

    useEffect(() => {
        document.addEventListener("scroll", handleScroll, true)
        document.addEventListener("touchmove", handleScroll, true)
        document.addEventListener("gesturechange", handleScroll, true)

        return () => {
            document.removeEventListener("scroll", handleScroll, true)
            document.removeEventListener("touchmove", handleScroll, true)
            document.removeEventListener("gesturechange", handleScroll, true)
        }
    }, [size, hasMore, messagesValidating])

    useEffect(() => {
        if (shouldScrollDown) {
            window.scrollTo(0, document.body.scrollHeight)
        } else if (prevScrollHeight.current && !messagesValidating) {
            const { scrollHeight } = document.scrollingElement
            window.scrollTo(0, prevScrollTop.current + (scrollHeight - prevScrollHeight.current))
            prevScrollHeight.current = null
        }
    }, [messages, messagesValidating])

    const sendMessage = async (e) => {
        e?.preventDefault()
        if (!content || !session) return

        setShouldScrollDown(true)

        const newMessage = {
            id: v4(),
            user_id: user.id,
            content: { [locale]: content },
            created_at: new Date(),
            locale
        }

        createMessage(newMessage)
            .then(() => sendData({ action: "create_message", data: newMessage }))

        insertMessage({ ...newMessage, user })
        setContent('')
    }

    return (
        <div className={cn(messages ? "opacity-1" : "opacity-0",
            "flex-container max-w-xl mx-auto justify-end !pb-16 transition-all"
        )}>
            <div className="flex flex-col gap-4 w-full flex-col-reverse">
                {messages?.map((message) => (
                    <Message
                        key={message.id}
                        message={message}
                        user={user}
                        isOnline={isOnline}
                        mutateMessage={mutateMessage}
                        deleteMessage={deleteMessage}
                        sendData={sendData}
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