import { GetStaticProps } from 'next'
import Image from "next/image"
import { toast } from "sonner"

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'

import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { isExport } from "@/utils/utils"

import {
    cn,
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

import ScrollingBanner from "@/components/scrolling-banner"

import CapacitorLogo from "@/../public/logos/capacitor.svg"
import NextJSLogo from "@/../public/logos/nextjs.svg"
import NextUILogo from "@/../public/logos/nextui.svg"
import StripeLogo from "@/../public/logos/stripe.svg"
import SupabaseLogo from "@/../public/logos/supabase.svg"
import TailwindLogo from "@/../public/logos/tailwind.svg"
import VercelLogo from "@/../public/logos/vercel.svg"
import { useIsHydrated } from "@/hooks/useIsHydrated"

export default function IndexPage() {
    const isHydrated = useIsHydrated()
    const { autoTranslate } = useAutoTranslate()

    return (
        <>
            <main className="container mx-auto flex flex-col grow items-center justify-center px-8 pt-8 gap-2">
                <section className="flex flex-col items-center justify-center gap-5 md:gap-6">
                    <div className="text-center font-bold leading-[1.2] tracking-tight text-5xl md:text-6xl">
                        <div className="bg-gradient-to-r from-foreground dark:to-foreground-500 to-secondary/70 bg-clip-text text-transparent">
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
                                    key="default"
                                    startContent={
                                        <PlusCircleIcon className="size-5" />
                                    }
                                    onPress={() => toast(autoTranslate("toast", "Toast"))}
                                >
                                    {autoTranslate("default", "Default")}
                                </DropdownItem>

                                <DropdownItem
                                    key="success"
                                    color="success"
                                    startContent={
                                        <CheckCircleIcon className="size-5" />
                                    }
                                    onPress={() => toast.success(autoTranslate("success", "Success"))}
                                >
                                    {autoTranslate("success", "Success")}
                                </DropdownItem>

                                <DropdownItem
                                    key="info"
                                    color="primary"
                                    startContent={
                                        <InformationCircleIcon className="size-5" />
                                    }
                                    onPress={() => toast.info(autoTranslate('info', 'Info'))}
                                >
                                    {autoTranslate("info", "Info")}
                                </DropdownItem>

                                <DropdownItem
                                    key="warning"
                                    color="warning"
                                    startContent={
                                        <ExclamationTriangleIcon className="size-5" />
                                    }
                                    onPress={() => toast.warning(autoTranslate("warning", "Warning"))}
                                >
                                    {autoTranslate("warning", "Warning")}
                                </DropdownItem>

                                <DropdownItem
                                    key="error"
                                    color="danger"
                                    startContent={
                                        <ExclamationCircleIcon className="size-5" />
                                    }
                                    onPress={() => toast.error(autoTranslate("error", "Error"))}
                                >
                                    {autoTranslate("error", "Error")}
                                </DropdownItem>

                                <DropdownItem
                                    key="loading"
                                    color="secondary"
                                    startContent={
                                        <Spinner size="sm" color="current" />
                                    }
                                    onPress={() => {
                                        const t = toast.loading(autoTranslate("loading", "Loading"))
                                        setTimeout(() => {
                                            toast.dismiss(t)
                                        }, 4000)
                                    }}
                                >
                                    {autoTranslate("loading", "Loading")}
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
                    className={cn(!isHydrated && "opacity-0",
                        "mx-auto w-full max-w-xl invert dark:invert-0 h-36 transition-all"
                    )}
                >
                    <ScrollingBanner shouldPauseOnHover={false} gap="2rem">
                        <Image src={NextJSLogo} className="w-32" alt="Next.js" />
                        <Image src={SupabaseLogo} className="w-36" alt="Supabase" />
                        <Image src={NextUILogo} className="w-36 h-36" alt="NextUI" />
                        <Image src={CapacitorLogo} className="w-36 grayscale invert" alt="Capacitor" />
                        <Image src={VercelLogo} className="w-36 h-36" alt="Vercel" />
                        <Image src={StripeLogo} className="w-24" alt="Stripe" />
                        <Image src={TailwindLogo} className="w-36 grayscale invert" alt="Tailwind CSS" />
                    </ScrollingBanner>
                </section>
            </main>
        </>
    )
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined