import React, { useState } from "react"
import { Button, Input, Checkbox, Link, Divider, Card, CardBody, ResizablePanel, cn } from "@nextui-org/react"
import { AnimatePresence, m, LazyMotion, domAnimation } from "framer-motion";
import { Icon } from "@iconify/react"
import { EnvelopeIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import BrandIcon from "@/components/brand-icon"

const authProviders = {
    apple: {
        name: "Apple",
        icon: <BrandIcon brand="apple" alt="Apple" className="size-[20px] -mt-0.5 dark:invert" />,
    },
    discord: {
        name: "Discord",
        icon: <BrandIcon brand="discord" alt="Discord" className="size-[22px]" />,
    },
    facebook: {
        name: "Facebook",
        icon: <BrandIcon brand="facebook" alt="Facebook" className="size-[21px]" />,
    },
    google: {
        name: "Google",
        icon: <BrandIcon brand="google" alt="Google" className="size-[18px]" />,
    },
    github: {
        name: "GitHub",
        icon: <BrandIcon brand="github" alt="GitHub" className="size-[20px] dark:invert" />,
    }
}

const variants = {
    visible: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: 10 },
}

export default function Login() {
    const [view, setView] = useState("login")
    const magicLink = true
    const providers = ["google", "facebook", "apple"]

    return (
        <div className="flex flex-col grow items-center justify-center p-4 gap-4">
            <Card fullWidth className="max-w-sm">
                <CardBody className="gap-4 px-8 pb-10 pt-6">
                    <p className="text-xl font-medium">
                        {view == "signup" ? "Sign Up" : view == "login" ? "Log In" : view == "forgot-password" ? "Forgot Password" : "Unknown View"}
                    </p>

                    <form
                        className="relative flex flex-col gap-3"
                        onSubmit={(e) => e.preventDefault()}
                    >
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            variant="bordered"
                        />

                        <Input
                            className={cn(
                                view != "forgot-password" ? "opacity-1" : "opacity-0 -mt-3 !h-0 overflow-hidden",
                                "transition-all"
                            )}
                            label="Password"
                            name="password"
                            type="password"
                            variant="bordered"
                        />

                        <Button color="primary" type="submit">
                            {view == "signup" ? "Sign Up" : view == "login" ? "Log In" : view == "forgot-password" ? "Send Reset Email" : "Unknown View"}
                        </Button>
                    </form>

                    <Link
                        className={cn(
                            view == "login" ? "opacity-1" : "opacity-0 -mt-4 !h-0 overflow-hidden",
                            "transition-all self-center cursor-pointer"
                        )}
                        size="sm"
                        onPress={() => setView("forgot-password")}
                    >
                        Forgot password?
                    </Link>

                    <div className="flex items-center gap-4 py-2">
                        <Divider className="flex-1" />

                        <p className="shrink-0 text-tiny text-default-500">
                            OR
                        </p>

                        <Divider className="flex-1" />
                    </div>

                    <div className="flex flex-col gap-2">
                        {magicLink && (
                            <Button
                                startContent={
                                    <EnvelopeIcon className="size-6" />
                                }
                                variant="flat"
                            >
                                Continue with Email
                            </Button>
                        )}

                        {providers?.length < 3 && (
                            <div className="flex flex-col gap-2">
                                {providers?.map((provider) => (
                                    <Button
                                        key={provider}
                                        startContent={authProviders[provider].icon}
                                        variant="flat"
                                    >
                                        Continue with {authProviders[provider].name}
                                    </Button>
                                ))}
                            </div>
                        )}


                        {providers?.length > 2 && (
                            <div className="flex gap-2 justify-stretch">
                                {providers?.map((provider) => (
                                    <Button
                                        key={provider}
                                        variant="flat"
                                        className="min-w-0 grow"
                                    >
                                        {authProviders[provider].icon}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>

                    <p className={cn(
                        view == "signup" ? "opacity-0 -mt-4 translate-y-1 h-0 overflow-hidden" : "opacity-1",
                        "text-center text-small transition-all"
                    )}>
                        Need to create an account?&nbsp;
                        <Link
                            size="sm"
                            onPress={() => setView("signup")}
                            className="cursor-pointer"
                        >
                            Sign Up
                        </Link>
                    </p>

                    <p className={cn(
                        view == "signup" ? "opacity-1" : "opacity-0 translate-y-3 -mt-4 h-0 overflow-hidden",
                        "text-center text-small transition-all"
                    )}>
                        Already have an account?&nbsp;
                        <Link
                            size="sm"
                            onPress={() => setView("login")}
                            className="cursor-pointer"
                        >
                            Log In
                        </Link>
                    </p>
                </CardBody>
            </Card>

            <p className="text-center text-small text-default-400">
                By continuing, you agree to our <a href="/terms" className="underline">Terms</a> and <a href="/privacy" className="underline">Privacy</a>.
            </p>
        </div>
    )
}
