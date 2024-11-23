import { useEffect, useMemo, useRef, useState } from 'react'
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
    const inputRef = useRef(null)

    useEffect(() => { whisperUser && setLastWhisperUser(whisperUser) }, [whisperUser])

    const prevScrollHeight = useRef(null)
    const prevScrollTop = useRef(null)

    const onData = ({ event, payload }, connection, peer) => {
        switch (event) {
            case "like_message": {
                const message = messages.find((message) => message.id == payload.message_id)
                if (!message) return

                mutateMessage({ ...message, likes: [...(message.likes || []), { user_id: peer.user_id, user: peer.user }] })
                break
            }
            case "unlike_message": {
                const message = messages.find((message) => message.id == payload.message_id)
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
        mutateEntity: mutateMessage,
        isLoading: messagesLoading
    } = useInfiniteEntities(
        "messages",
        { lang: locale, limit: 20 },
        null,
        { provider: "supabase", enabled: !!session, onData }
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
        mutateEntity: mutateWhisper,
        isLoading: whispersLoading
    } = useInfiniteEntities(session &&
        "whispers",
        { lang: locale, limit: 20 },
        null,
        {
            provider: "peerjs",
            enabled: !!session,
            onData,
            room: `whispers_${session?.user.id}`,
            listenOnly: true
        }
    )

    const isValidating = messagesValidating || whispersValidating

    const { sendData: sendWhisperData } = usePeers({
        enabled: !!lastWhisperUser,
        room: `whispers_${lastWhisperUser?.id}`,
        allowedUsers: [lastWhisperUser?.id],
    })

    const messagesAndWhispers = useMemo(() =>
        (!messagesLoading && !whispersLoading)
            ? [...(messages || []), ...(whispers || [])]?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            : null
        , [messages, whispers, messagesLoading, whispersLoading])

    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = document.scrollingElement
        prevScrollTop.current = scrollTop

        if (scrollTop < 512) {
            prevScrollHeight.current = scrollHeight

            if (hasMore && !isValidating) {
                setSize(size + 1)
            }

            if (hasMoreWhispers && !isValidating) {
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
    }, [size, whispersSize, hasMore, hasMoreWhispers, isValidating])

    useEffect(() => {
        if (shouldScrollDown) {
            const scrollDistane = document.scrollingElement.scrollHeight - document.scrollingElement.scrollTop
            window.scrollTo({ top: document.scrollingElement.scrollHeight, behavior: scrollDistane < 1024 ? "auto" : "auto" })
            size > 1 && setSize(1)
            whispersSize > 1 && setWhispersSize(1)
        } else if (prevScrollHeight.current && !messagesValidating && !whispersValidating) {
            const { scrollHeight } = document.scrollingElement
            window.scrollTo(0, prevScrollTop.current + (scrollHeight - prevScrollHeight.current))
            prevScrollHeight.current = null
        }
    }, [messagesAndWhispers, isValidating])

    const sendMessage = async (e) => {
        e?.preventDefault()
        if (!content || !session) return

        setShouldScrollDown(true)

        if (whisperUser) {
            const newWhisper = {
                recipient_id: whisperUser.id,
                content: { [locale]: content },
                user_id: user.id,
            }

            createWhisper(newWhisper, { user, recipient: whisperUser }).then(() => sendWhisperData({ event: "create_entity", data: newWhisper }))
        } else {
            const newMessage = { content: { [locale]: content }, user_id: user.id }

            createMessage(newMessage, { user })
        }

        setContent('')
        setWhisperUser(null)
    }

    useEffect(() => {
        whisperUser && inputRef.current?.focus()
    }, [whisperUser])

    return (
        <div className={cn((!sessionLoading && messagesAndWhispers) ? "opacity-1" : "opacity-0",
            "flex px-5 flex-col w-full max-w-xl mx-auto justify-end transition-all"
        )}>
            <div className="sticky top-0 h-[60px] md:h-[76px] bg-background z-20" />

            <div
                className={cn(
                    "sticky top-[60px] h-[40px] md:top-[76px] bg-gradient-to-b from-background to-transparent z-20"
                )}
            />

            <div className="flex flex-col gap-4 w-full flex-col-reverse py-4 mb-16">
                {messagesAndWhispers?.map((message) => (
                    <Message
                        key={message.id}
                        message={message}
                        user={user}
                        isOnline={isOnline}
                        mutateMessage={message.recipient_id ? mutateWhisper : mutateMessage}
                        updateMessage={message.recipient_id ? updateWhisper : updateMessage}
                        deleteMessage={message.recipient_id ? deleteWhisper : deleteMessage}
                        sendData={sendMessageData}
                        sendWhisperData={sendWhisperData}
                        setWhisperUser={setWhisperUser}
                    />
                ))}
            </div>

            <div className="fixed bottom-0 left-0 w-full flex flex-col z-20">
                <div
                    className={cn(shouldScrollDown ? "opacity-0" : "opacity-100",
                        "bg-gradient-to-t from-background/90 to-transparent w-full h-[40px] transition-all"
                    )}
                />

                <form onSubmit={sendMessage} className="mx-auto w-full max-w-xl bg-background px-4 pb-safe">
                    <Input
                        className="mb-4"
                        autoFocus
                        ref={inputRef}
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