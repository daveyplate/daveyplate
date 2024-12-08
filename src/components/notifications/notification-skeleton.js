import { Skeleton } from "@nextui-org/react"

const NotificationSkeleton = () => {
    return (
        <div className="flex gap-3 border-b border-divider px-6 py-4">
            <Skeleton className="rounded-full size-10" />

            <div className="flex flex-col gap-1">
                <Skeleton className="w-56 h-4 my-0.5 rounded-full" />
                <Skeleton className="w-20 h-3 my-0.5 rounded-full" />
            </div>
        </div>
    )
}

export default NotificationSkeleton
