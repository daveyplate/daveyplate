import { cn, Skeleton } from "@nextui-org/react"

const ChatMessageSkeleton = ({ reverse = false }) => {
    return (
        <div className={cn("flex gap-3 animate-pulse", reverse && "flex-row-reverse")}>
            <Skeleton className="rounded-full size-10 flex-shrink-0" />

            <div className="flex max-w-[70%] w-72 flex-col gap-4">
                <div
                    className="flex flex-col w-full rounded-medium px-4 py-3 gap-3 bg-content2"
                >
                    <div className="flex gap-3 justify-between">
                        <Skeleton className="w-24 h-5 rounded-full" />
                        <Skeleton className="w-12 h-5 rounded-full" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Skeleton className="w-full h-5 rounded-full" />
                        <Skeleton className="w-[70%] h-5 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatMessageSkeleton