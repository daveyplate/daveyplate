import React from "react";
import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import NewFooter from "@/components/new-footer";

// import FadeInImage from "./fade-in-image";

export default function IndexPage() {
    return (
        <>
            <main className="container mx-auto flex flex-1 flex-col items-center justify-center overflow-hidden px-8">
                <section className="z-20 flex flex-col items-center justify-center gap-[18px] sm:gap-6">
                    <div className="text-center text-[clamp(40px,10vw,44px)] font-bold leading-[1.2] tracking-tight sm:text-[64px]">
                        <div className="bg-gradient-to-r from-foreground to-foreground-400 bg-clip-text text-transparent">
                            Welcome to <br /> Daveyplate.
                        </div>
                    </div>

                    <p className="text-center font-normal leading-7 text-default-500 sm:w-[466px] sm:text-[18px]">
                        Daveyplate is a boilerplate project with a full-featured user management system built with Next.js, NextUI, and Supabase, deployed on Vercel.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                        <Button
                            className="h-10 w-[163px] bg-default-foreground px-[16px] py-[10px] text-small font-medium leading-5 text-background"
                            radius="full"
                        >
                            Get Started
                        </Button>

                        <Button
                            className="h-10 w-[163px] border-1 border-default-100 px-[16px] py-[10px] text-small font-medium leading-5"
                            endContent={
                                <span className="pointer-events-none flex h-[22px] w-[22px] items-center justify-center rounded-full bg-default-100">
                                    <Icon
                                        className="text-default-500 [&>path]:stroke-[1.5]"
                                        icon="solar:arrow-right-linear"
                                        width={16}
                                    />
                                </span>
                            }
                            radius="full"
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
