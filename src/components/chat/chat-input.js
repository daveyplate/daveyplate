import UserAvatar from '@/components/user-avatar'
import { ArrowUpIcon } from "@heroicons/react/24/solid"
import { Button, Chip, Form, Input } from "@nextui-org/react"
import { useEffect, useRef } from "react"

export default function ChatInput({ content, setContent, session, whisperUser, setWhisperUser, sendMessage }) {
    const inputRef = useRef(null)

    useEffect(() => {
        whisperUser && inputRef.current?.focus()
    }, [whisperUser])

    return (
        <Form
            className="px-4 mt-auto flex flex-col w-full max-w-xl items-center"
            onSubmit={sendMessage}
        >
            <Input
                ref={inputRef}
                autoFocus
                size="lg"
                variant="bordered"
                placeholder={
                    session ?
                        (whisperUser ? `Whisper...` : "Message...")
                        : "Sign in to send messages"
                }
                value={content}
                onValueChange={setContent}
                isDisabled={!session}
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
        </Form>
    )
}