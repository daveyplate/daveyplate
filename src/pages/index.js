import Image from "next/image"
import { cn } from "@daveyplate/tailwind-drag-dropzone"
import { useIsClient } from "@uidotdev/usehooks"
import { toast } from "sonner"

import { useAutoTranslate, AutoTranslate } from 'next-auto-translate'

import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { isExport } from "@/utils/utils"

import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Spinner
} from "@nextui-org/react"

import {
    ArrowRightIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    PlusCircleIcon,
    RocketLaunchIcon
} from "@heroicons/react/24/outline"

import NewFooter from "@/components/footer"
import ScrollingBanner from "@/components/scrolling-banner"

import NextJSLogo from "@/../public/logos/nextjs.svg"
import SupabaseLogo from "@/../public/logos/supabase.svg"
import NextUILogo from "@/../public/logos/nextui.svg"
import CapacitorLogo from "@/../public/logos/capacitor.svg"
import VercelLogo from "@/../public/logos/vercel.svg"
import StripeLogo from "@/../public/logos/stripe.svg"
import TailwindLogo from "@/../public/logos/tailwind.svg"

export default function IndexPage() {
    const isClient = useIsClient()
    const { autoTranslate } = useAutoTranslate()

    return (
        <>
            <main className="container mx-auto flex flex-col grow items-center justify-center px-8 pt-8 gap-2">
                <section className="flex flex-col items-center justify-center gap-5 md:gap-6">
                    <div className="text-center font-bold leading-[1.2] tracking-tight text-5xl md:text-6xl">
                        <div className="bg-gradient-to-r from-foreground to-foreground-500 bg-clip-text text-transparent">
                            <AutoTranslate tKey="welcome_to">
                                Welcome to
                            </AutoTranslate>

                            <br />

                            Daveyplate.
                        </div>
                    </div>

                    <p className="text-center leading-7 text-default-500 max-w-sm">
                        <AutoTranslate tKey="intro_card">
                            Daveyplate is an open source boilerplate project with a fully featured user management system - built with Next.js, NextUI, and Supabase.
                        </AutoTranslate>
                    </p>

                    <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
                        <Dropdown placement="top">
                            <DropdownTrigger>
                                <Button
                                    color="primary"
                                    startContent={
                                        <RocketLaunchIcon className="size-5" />
                                    }
                                >
                                    <AutoTranslate tKey="show_toast">
                                        Show Toast
                                    </AutoTranslate>
                                </Button>
                            </DropdownTrigger>

                            <DropdownMenu>
                                <DropdownItem
                                    startContent={
                                        <PlusCircleIcon className="size-5" />
                                    }
                                    onPress={() => toast(autoTranslate("toast", "Toast"))}
                                >
                                    <AutoTranslate tKey="default">
                                        Default
                                    </AutoTranslate>
                                </DropdownItem>

                                <DropdownItem
                                    color="success"
                                    startContent={
                                        <CheckCircleIcon className="size-5" />
                                    }
                                    onPress={() => toast.success(autoTranslate("success", "Success"))}
                                >
                                    Success
                                </DropdownItem>

                                <DropdownItem
                                    color="primary"
                                    startContent={
                                        <InformationCircleIcon className="size-5" />
                                    }
                                    onPress={() => toast.info(autoTranslate('info', 'Info'))}
                                >
                                    <AutoTranslate tKey="info">
                                        Info
                                    </AutoTranslate>
                                </DropdownItem>

                                <DropdownItem
                                    color="warning"
                                    startContent={
                                        <ExclamationTriangleIcon className="size-5" />
                                    }
                                    onPress={() => toast.warning(autoTranslate("warning", "Warning"))}
                                >
                                    <AutoTranslate tKey="warning">
                                        Warning
                                    </AutoTranslate>
                                </DropdownItem>

                                <DropdownItem
                                    color="danger"
                                    startContent={
                                        <ExclamationCircleIcon className="size-5" />
                                    }
                                    onPress={() => toast.error(autoTranslate("error", "Error"))}
                                >
                                    <AutoTranslate tKey="error">
                                        Error
                                    </AutoTranslate>
                                </DropdownItem>

                                <DropdownItem
                                    color="secondary"
                                    startContent={
                                        <Spinner size="sm" color="current" />
                                    }
                                    onPress={() => {
                                        toast.loading(autoTranslate("loading", "Loading"))
                                        setTimeout(() => {
                                            toast.dismiss()
                                        }, 4000)
                                    }}
                                >
                                    <AutoTranslate tKey="loading">
                                        Loading
                                    </AutoTranslate>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>

                        <Button
                            className="border-1 hidden"
                            endContent={
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-default">
                                    <ArrowRightIcon
                                        className="size-3.5"
                                    />
                                </span>
                            }
                            variant="bordered"
                        >
                            <AutoTranslate tKey="see_our_plans">
                                See our plans
                            </AutoTranslate>
                        </Button>
                    </div>
                </section>

                <section
                    className={cn(isClient ? "opacity-1" : "opacity-0",
                        "mx-auto w-full max-w-xl invert dark:invert-0 h-36 transition-all"
                    )}
                >
                    <ScrollingBanner shouldPauseOnHover={false} gap="2rem">
                        <Image src={NextJSLogo} className="w-32" alt="Next.js" />
                        <Image src={SupabaseLogo} className="w-36" alt="Supabase" />
                        <Image src={NextUILogo} className="w-36" alt="NextUI" />
                        <Image src={CapacitorLogo} className="w-36 grayscale invert" alt="Capacitor" />
                        <Image src={VercelLogo} className="w-40" alt="Vercel" />
                        <Image src={StripeLogo} className="w-24" alt="Stripe" />
                        <Image src={TailwindLogo} className="w-36 grayscale invert" alt="Tailwind CSS" />
                    </ScrollingBanner>
                </section>
            </main>
        </>
    )
}

export async function getStaticProps({ locale, params }) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined