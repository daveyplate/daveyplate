import { toast } from "sonner"
import { Button } from "@nextui-org/react"
import { ArrowRightIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"

import NewFooter from "@/components/new-footer"

export default function IndexPage() {
    return (
        <>
            <main className="container mx-auto flex flex-col grow items-center justify-center px-8 py-4">
                <section className="flex flex-col items-center justify-center gap-5 md:gap-6">
                    <div className="text-center font-bold leading-[1.2] tracking-tight text-5xl md:text-6xl">
                        <div className="bg-gradient-to-r from-foreground to-foreground-500 bg-clip-text text-transparent">
                            Welcome to <br /> Daveyplate.
                        </div>
                    </div>

                    <p className="text-center leading-7 text-default-500 max-w-sm">
                        Daveyplate is an open source boilerplate project with a fully featured user management system - built with Next.js, NextUI, and Supabase.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
                        <Button
                            color="primary"
                            startContent={
                                <ExclamationTriangleIcon className="size-5" />
                            }
                            onPress={() => {
                                toast.info("Have a slice!")
                            }}
                        >
                            Show Toast
                        </Button>

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
                            See our plans
                        </Button>
                    </div>
                </section>
            </main>

            <NewFooter />
        </>
    );
}
