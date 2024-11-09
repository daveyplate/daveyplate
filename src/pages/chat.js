import { useEffect, useRef, useState } from 'react'
import { v4 } from 'uuid'
import { useSession } from '@supabase/auth-helpers-react'

import { useEntity, useMutateEntities } from '@daveyplate/supabase-swr-entities/client'

import { Button, Input, cn } from "@nextui-org/react"
import { ArrowUpIcon } from '@heroicons/react/24/solid'

import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { isExport } from "@/utils/utils"

import { usePeers } from '@/hooks/usePeers'
import MessagesPage from '@/components/chat/messages-page'

export default function Chat() {
    const session = useSession()
    const [pageCount, setPageCount] = useState(1)
    const [messageCount, setMessageCount] = useState(0)
    const [createMessage, setCreateMessage] = useState(null)
    const mutateEntities = useMutateEntities()
    const pageLimit = 100
    const { entity: user } = useEntity(session && 'profiles', 'me')

    const { send: sendData, isOnline } = usePeers({
        enabled: !!session,
        onData: () => {
            [...Array(pageCount).keys()].map((page) => {
                console.log({ limit: pageLimit, offset: page * pageLimit })
                mutateEntities("messages", { limit: pageLimit, offset: page * pageLimit })
            })
        },
        room: "chat"
    })

    const [content, setContent] = useState('')
    const [shouldScrollDown, setShouldScrollDown] = useState(true)
    const prevScrollHeight = useRef(null)

    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = document.scrollingElement

        if (scrollTop == 0) {
            prevScrollHeight.current = scrollHeight

            if (messageCount > pageCount * pageLimit) {
                setPageCount(prevCount => prevCount + 1)
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
        setContent('')
    }

    return (
        <div className={cn(messageCount == 0 ? "opacity-0" : "opacity-1",
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
                        setMessageCount={setMessageCount}
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