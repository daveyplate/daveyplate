import { useSessionContext } from "@supabase/auth-helpers-react"
import { useLocale } from "next-intl"
import { useEffect, useMemo, useRef, useState } from "react"

import { useEntity, useInfiniteEntities, usePeers } from "@daveyplate/supabase-swr-entities/client"

import { cn, ScrollShadow } from "@nextui-org/react"

import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from "@/i18n/translation-props"
import { isExport } from "@/utils/utils"

import ChatInput from "@/components/chat/chat-input"
import ChatMessage from "@/components/chat/chat-message"

export default function Chat() {
    const { session, isLoading: sessionLoading } = useSessionContext()
    const locale = useLocale()
    const { entity: user } = useEntity(session && "profiles", "me")
    const [content, setContent] = useState("")
    const [shouldScrollDown, setShouldScrollDown] = useState(true)
    const [lastWhisperUser, setLastWhisperUser] = useState(null)
    const [whisperUser, setWhisperUser] = useState(null)
    const scrollRef = useRef(null)

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
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
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
        scrollRef.current?.addEventListener("scroll", handleScroll, true)
        return () => scrollRef.current?.removeEventListener("scroll", handleScroll, true)
    }, [size, whispersSize, hasMore, hasMoreWhispers, isValidating])

    useEffect(() => {
        if (shouldScrollDown) {
            const scrollDistance = scrollRef.current.scrollHeight - scrollRef.current.scrollTop
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: scrollDistance < 1024 ? "auto" : "auto" })
            size > 1 && setSize(1)
            whispersSize > 1 && setWhispersSize(1)
        } else if (prevScrollHeight.current && !messagesValidating && !whispersValidating) {
            const { scrollHeight } = scrollRef.current
            scrollRef.current?.scrollTo({ top: scrollHeight - prevScrollHeight.current, behavior: "auto" })
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

        setContent("")
        setWhisperUser(null)
    }

    return (
        <div className={cn((sessionLoading || !messagesAndWhispers) && "opacity-0",
            "flex flex-col grow max-h-[calc(100vh-76px-64px)] items-center transition-all"
        )}>
            <ScrollShadow ref={scrollRef} className="flex flex-col  w-full items-center">
                <div className="max-w-xl w-full flex flex-col-reverse gap-6 px-6 py-4">
                    {messagesAndWhispers?.map((message) => (
                        <ChatMessage
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
            </ScrollShadow>

            <ChatInput
                content={content}
                setContent={setContent}
                session={session}
                whisperUser={whisperUser}
                setWhisperUser={setWhisperUser}
                sendMessage={sendMessage}
            />
        </div>
    )
}

export async function getStaticProps({ locale, params }) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined