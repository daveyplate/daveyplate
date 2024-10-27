import { AutoTranslate } from 'next-auto-translate'
import { useEntities, useEntity } from '@daveyplate/supabase-swr-entities/client'

import { Button, Card, CardBody, Input, cn } from "@nextui-org/react"

import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { isExport } from "@/utils/utils"
import { useEffect, useState } from 'react'
import UserAvatar from '@/components/user-avatar'
import ReactTimeAgo from 'react-time-ago'
import { ArrowUpIcon } from '@heroicons/react/24/solid'
import { useSession } from '@supabase/auth-helpers-react'
import { v4 } from 'uuid'
import { useLocale } from 'next-intl'

export default function Messages() {
    const session = useSession()
    const locale = useLocale()
    const { entity: user } = useEntity(session && 'profiles', 'me')

    const {
        entities: messages,
        createEntity: createMessage,
        mutateEntities: mutateMessages
    } = useEntities('messages')

    const [content, setContent] = useState('')

    useEffect(() => {
        // scroll to bottom
        window.scrollTo(0, document.body.scrollHeight)
    }, [messages])

    const sendMessage = (e) => {
        e.preventDefault()

        if (!content || !session) return

        const newMessage = {
            id: v4(),
            user_id: user.id,
            content,
            created_at: new Date()
        }
        createMessage(newMessage)
        mutateMessages([...messages, { ...newMessage, user }], false)

        setContent('')
    }

    return (
        <div className="flex-container max-w-xl mx-auto justify-end relative">
            {messages?.map((message, index) => (
                <div
                    key={index}
                    className={cn(
                        "flex gap-4 w-full",
                        message.user_id === user?.id && "flex-row-reverse"
                    )}
                >
                    <UserAvatar user={message.user} />

                    <Card className="grow max-w-[75%]">
                        <CardBody className="px-4 py-3 gap-2">
                            <div className="flex">
                                <h6>{message.user?.full_name || "Unnamed"}</h6>

                                <ReactTimeAgo
                                    className="ms-auto text-small font-light text-foreground/60"
                                    date={message.created_at}
                                    locale={locale}
                                />
                            </div>

                            <p className="font-light text-foreground-80">
                                {message.content}
                            </p>
                        </CardBody>
                    </Card>
                </div>
            ))}

            <form onSubmit={sendMessage} className="sticky bottom-16 w-full">
                <Input
                    className="bg-background/70 backdrop-blur-xl"
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
                            type="submit"
                            size="sm"
                            color="primary"
                            isIconOnly
                            radius="full"
                            className="-me-1"
                            isDisabled={!content || !session}
                        >
                            <ArrowUpIcon className="size-4" />
                        </Button>
                    }
                />
            </form>
        </div>
    )
}

export async function getStaticProps({ locale, params }) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined