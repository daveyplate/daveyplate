import React from 'react'
import { useRouter } from 'next/router'

import { useAutoTranslate } from "next-auto-translate"

import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react"
import { EllipsisHorizontalIcon, ExclamationTriangleIcon, ShareIcon } from '@heroicons/react/24/solid'
import { toast } from 'sonner'

const OptionsDropdown = (
    { className, isDisabled, variant = "light" }: {
        className: string,
        isDisabled: boolean,
        variant: "light" | "shadow" | "solid" | "bordered" | "flat" | "faded" | "ghost" | undefined
    }
) => {
    const { autoTranslate } = useAutoTranslate()
    const linkCopiedText = autoTranslate('link_copied', 'Link copied to clipboard')
    const router = useRouter()

    const handleReport = () => {
        // Handle report action
        console.log("Report action triggered")
    }

    const handleShare = async () => {
        // Extract metadata
        const title = document.querySelector('title')?.textContent || ""

        // Handle share action
        if (navigator.share) {
            try {
                await navigator.share({
                    url: `${process.env.NEXT_PUBLIC_BASE_URL}${router.asPath}`,
                    title: title
                })
            } catch (error) {
                console.error(error)
            }
        } else {
            try {
                await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BASE_URL}${router.asPath}`)
                toast.success(linkCopiedText)
            } catch (error) {
                console.error(error)
            }
        }
    }

    return (
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <Button
                    isIconOnly
                    variant={variant}
                    aria-label="More options"
                    disableRipple
                    radius="full"
                    className={className}
                    isDisabled={isDisabled}
                    size="sm"
                >
                    <EllipsisHorizontalIcon className="size-6" />
                </Button>
            </DropdownTrigger>

            <DropdownMenu aria-label="Options actions">
                <DropdownItem
                    key="share"
                    startContent={<ShareIcon className="size-4" />}
                    onPress={handleShare}
                >
                    {autoTranslate("share", "Share")}
                </DropdownItem>

                <DropdownItem
                    key="report"
                    className="text-danger hidden"
                    color="danger"
                    startContent={<ExclamationTriangleIcon className="size-5" />}
                    onPress={handleReport}
                >
                    {autoTranslate("report", "Report")}
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}

export default OptionsDropdown