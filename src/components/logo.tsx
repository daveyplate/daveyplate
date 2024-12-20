import { cn } from "@nextui-org/react"
import Image from "next/image"

const siteName = process.env.NEXT_PUBLIC_SITE_NAME

export default function Logo({ className }: { className?: string }) {
    return (
        <Image
            width={24}
            height={24}
            src="/apple-touch-icon.png"
            alt={siteName || "Logo"}
            className={cn("rounded-full", className)}
        />
    )
}