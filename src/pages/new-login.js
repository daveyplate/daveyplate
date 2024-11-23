import React, { useState } from "react"
import { Button, Input, Checkbox, Link, Divider, Card, CardBody } from "@nextui-org/react"
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

export default function Login() {
    const [isVisible, setIsVisible] = useState(false)
    const [view, setView] = useState("login")
    const magicLink = true
    const providers = ["google", "facebook", "apple"]

    const toggleVisibility = () => setIsVisible(!isVisible)

    return (
        <div className="flex flex-col grow items-center justify-center p-4 gap-4">
            <Card
                fullWidth
                className="max-w-sm"
            >
                <CardBody className="gap-4 px-8 pb-8 pt-6">
                    <p className="text-xl font-medium">Log In</p>

                    <form
                        className="flex flex-col gap-3"
                        onSubmit={(e) => e.preventDefault()}
                    >
                        <Input
                            label="Email Address"
                            name="email"
                            placeholder="Enter your email"
                            type="email"
                            variant="bordered"
                        />

                        <Input
                            endContent={
                                <button
                                    type="button"
                                    onClick={toggleVisibility}
                                >
                                    {isVisible ? (
                                        <EyeSlashIcon className="text-default-400 size-6" />
                                    ) : (
                                        <EyeIcon className="text-default-400 size-6" />
                                    )}
                                </button>
                            }
                            label="Password"
                            name="password"
                            placeholder="Enter your password"
                            type={isVisible ? "text" : "password"}
                            variant="bordered"
                        />

                        <Button color="primary" type="submit">
                            Log In
                        </Button>
                    </form>

                    <Link className="self-center" href="#" size="sm">
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
                                variant="bordered"
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
                                        variant="bordered"
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
                                        variant="bordered"
                                        className="min-w-0 grow"
                                    >
                                        {authProviders[provider].icon}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>

                    <p className="text-center text-small">
                        Need to create an account?&nbsp;
                        <Link href="#" size="sm">
                            Sign Up
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
