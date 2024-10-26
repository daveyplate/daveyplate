import React from 'react'
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react"
import { EllipsisHorizontalIcon, ExclamationTriangleIcon, ShareIcon } from '@heroicons/react/24/solid'
import { useAutoTranslate } from "next-auto-translate"
import { toast } from './providers/toast-provider'
import { useRouter } from 'next/router'

const OptionsDropdown = () => {
    const { autoTranslate } = useAutoTranslate()
    const linkCopiedText = autoTranslate('link_copied', 'Link copied to clipboard')
    const router = useRouter()

    const handleReport = () => {
        // Handle report action
        console.log("Report action triggered")
    }

    const handleShare = async () => {
        // Extract metadata
        const title = document.querySelector('title').textContent;

        // Handle share action
        if (navigator.share) {
            try {
                await navigator.share({
                    url: `${process.env.NEXT_PUBLIC_BASE_URL}${router.asPath}`,
                    title: title
                })
            } catch (error) {
                console.error("Error sharing:", error)
            }
        } else {
            try {
                await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BASE_URL}${router.asPath}`)
                toast(linkCopiedText, { color: 'secondary' })
            } catch (error) {
                console.error("Error copying to clipboard:", error)
            }
        }
    }

    return (
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <Button
                    isIconOnly
                    variant="light"
                    aria-label="More options"
                    disableRipple
                    radius="full"
                >
                    <EllipsisHorizontalIcon className="size-7" />
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Options actions" itemClasses={{ title: "!text-lg", base: "gap-4" }}>
                <DropdownItem
                    key="share"
                    startContent={<ShareIcon className="size-5" />}
                    onPress={handleShare}
                >
                    {autoTranslate("share", "Share")}
                </DropdownItem>

                <DropdownItem
                    key="report"
                    className="text-danger hidden"
                    color="danger"
                    startContent={<ExclamationTriangleIcon className="size-6 mt-0.5 -me-1" />}
                    onPress={handleReport}
                >
                    {autoTranslate("report", "Report")}
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}

export default OptionsDropdown