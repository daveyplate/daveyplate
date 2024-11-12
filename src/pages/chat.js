import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { v4 } from 'uuid'
import { useSessionContext } from '@supabase/auth-helpers-react'

import { useEntity, useInfiniteEntities, usePeers } from '@daveyplate/supabase-swr-entities/client'

import { Button, Chip, Input, cn } from "@nextui-org/react"
import { ArrowUpIcon } from '@heroicons/react/24/solid'

import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { isExport } from "@/utils/utils"

import Message from '@/components/chat/message'
import UserAvatar from '@/components/user-avatar'

export default function Chat() {
    const { session, isLoading: sessionLoading } = useSessionContext()
    const locale = useLocale()
    const { entity: user } = useEntity(session && 'profiles', 'me')
    const [content, setContent] = useState('')
    const [shouldScrollDown, setShouldScrollDown] = useState(true)
    const [lastWhisperUser, setLastWhisperUser] = useState(null)
    const [whisperUser, setWhisperUser] = useState(null)

    useEffect(() => {
        if (whisperUser) {
            setLastWhisperUser(whisperUser)
        }
    }, [whisperUser])

    const prevScrollHeight = useRef(null)
    const prevScrollTop = useRef(null)

    const onData = (data, connection, peer) => {
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
        }
    }

    const {
        entities: messages,
        isValidating: messagesValidating,
        size,
        setSize,
        hasMore,
        isOnline,
        sendData: sendMessageData,
        createEntity: createMessage,
        updateEntity: updateMessage,
        deleteEntity: deleteMessage,
        insertEntity: insertMessage,
        mutateEntity: mutateMessage,
        isLoading: messagesLoading
    } = useInfiniteEntities(
        "messages",
        { lang: locale, limit: 10 },
        null,
        { realtime: session && "peerjs", onData }
    )

    const {
        entities: whispers,
        isValidating: whispersValidating,
        size: whispersSize,
        setSize: setWhispersSize,
        hasMore: hasMoreWhispers,
        createEntity: createWhisper,
        updateEntity: updateWhisper,
        deleteEntity: deleteWhisper,
        insertEntity: insertWhisper,
        mutateEntity: mutateWhisper,
        isLoading: whispersLoading
    } = useInfiniteEntities(session &&
        "whispers",
        { lang: locale, limit: 10 },
        null,
        {
            realtime: session && "peerjs",
            onData,
            room: `whispers_${session?.user.id}`,
            listenOnly: true
        }
    )

    const { sendData: sendWhisperData } = usePeers({
        enabled: !!lastWhisperUser,
        room: `whispers_${lastWhisperUser?.id}`,
        allowedUsers: [lastWhisperUser?.id],
    })

    const messagesAndWhispers = (!messagesLoading && !whispersLoading) ? [...(messages || []), ...(whispers || [])] : null
    messagesAndWhispers?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = document.scrollingElement
        prevScrollTop.current = scrollTop

        if (scrollTop < 512) {
            prevScrollHeight.current = scrollHeight

            if (hasMore && !messagesValidating) {
                setSize(size + 1)
            }

            if (hasMoreWhispers && !whispersValidating) {
                setWhispersSize(whispersSize + 1)
            }
        }

        const isAtBottom = scrollTop + clientHeight >= scrollHeight
        setShouldScrollDown(isAtBottom)
    }

    useEffect(() => {
        document.addEventListener("scroll", handleScroll, true)
        // document.addEventListener("touchmove", handleScroll, true)
        // document.addEventListener("gesturechange", handleScroll, true)

        return () => {
            document.removeEventListener("scroll", handleScroll, true)
            // document.removeEventListener("touchmove", handleScroll, true)
            // document.removeEventListener("gesturechange", handleScroll, true)
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

        if (whisperUser) {
            const newWhisper = {
                id: v4(),
                user_id: user.id,
                recipient_id: whisperUser.id,
                content: { [locale]: content },
                created_at: new Date(),
                locale
            }

            createWhisper(newWhisper).then(() => sendWhisperData({ action: "create_entity", data: newWhisper }))
            insertWhisper({ ...newWhisper, user, recipient: whisperUser })
        } else {
            const newMessage = {
                id: v4(),
                user_id: user.id,
                content: { [locale]: content },
                created_at: new Date(),
                locale
            }

            createMessage(newMessage)
            insertMessage({ ...newMessage, user })
        }

        setContent('')
        setWhisperUser(null)
    }

    return (
        <div className={cn((!sessionLoading && messagesAndWhispers) ? "opacity-1" : "opacity-0",
            "flex-container max-w-xl mx-auto justify-end !pb-16 transition-all"
        )}>
            <div className="flex flex-col gap-4 w-full flex-col-reverse">
                {messagesAndWhispers?.map((message) => (
                    <Message
                        key={message.id}
                        message={message}
                        user={user}
                        isOnline={isOnline}
                        mutateMessage={message.recipient_id ? mutateWhisper : mutateMessage}
                        updateMessage={message.recipient_id ? updateWhisper : updateMessage}
                        deleteMessage={message.recipient_id ? deleteWhisper : deleteMessage}
                        shouldScrollDown={shouldScrollDown}
                        sendData={sendMessageData}
                        sendWhisperData={sendWhisperData}
                        setWhisperUser={setWhisperUser}
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
                                ? whisperUser
                                    ? `Whisper...`
                                    : "Message..."
                                : "Sign in to send messages"
                        }
                        value={content}
                        onValueChange={setContent}
                        isDisabled={!session}
                        autoComplete='off'
                        startContent={
                            whisperUser && (
                                <Chip
                                    size="lg"
                                    variant="flat"
                                    color="secondary"
                                    className="-ms-1 gap-1"
                                    avatar={
                                        <UserAvatar user={whisperUser} />
                                    }
                                    onClose={() => setWhisperUser(null)}
                                >
                                    <div className="max-w-20 overflow-hidden truncate">
                                        {whisperUser.full_name}
                                    </div>
                                </Chip>
                            )
                        }
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