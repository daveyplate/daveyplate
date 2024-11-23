import React, { useState } from "react"
import { Button, Input, Checkbox, Link, Divider, Card, CardBody } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import BrandIcon from "@/components/brand-icon"

export default function Login() {
    const [isVisible, setIsVisible] = useState(false)

    const toggleVisibility = () => setIsVisible(!isVisible)

    return (
        <div className="flex flex-col grow items-center justify-center p-4">
            <Card
                fullWidth
                className="max-w-sm px-2 pb-3 pt-2"
            >
                <CardBody className="gap-4">
                    <p className="text-xl font-medium">Log In</p>

                    <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                        <Input
                            label="Email Address"
                            name="email"
                            placeholder="Enter your email"
                            type="email"
                            variant="bordered"
                        />

                        <Input
                            endContent={
                                <button type="button" onClick={toggleVisibility}>
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


                    <div className="flex gap-2 justify-stretch mb-2">
                        <Button
                            variant="bordered"
                            className="min-w-0 grow"
                        >
                            <BrandIcon brand="discord" className="size-[24px]" />
                        </Button>

                        <Button
                            variant="bordered"
                            className="min-w-0 grow"
                        >
                            <BrandIcon brand="google" className="size-[20px]" />
                        </Button>

                        <Button
                            variant="bordered"
                            className="min-w-0 grow"
                        >
                            <BrandIcon brand="facebook" className="size-[22px]" />
                        </Button>

                        <Button
                            variant="bordered"
                            className="min-w-0 grow"
                        >
                            <BrandIcon brand="apple" className="size-[22px] -mt-0.5 dark:invert" />
                        </Button>
                    </div>

                    <div className="flex flex-col gap-2 hidden">
                        <Button
                            startContent={<Icon className="text-default-500" icon="logos:discord-icon" width={24} />}
                            variant="bordered"
                        >
                            Continue with Discord
                        </Button>
                        <Button
                            startContent={<Icon icon="flat-color-icons:google" width={24} />}
                            variant="bordered"
                        >
                            Continue with Google
                        </Button>
                        <Button
                            startContent={<Icon icon="logos:facebook" width={22} />}
                            variant="bordered"
                        >
                            Continue with Facebook
                        </Button>
                        <Button
                            startContent={<Icon icon="fa:apple" width={18} className="mb-0.5" />}
                            variant="bordered"
                        >
                            Continue with Apple
                        </Button>

                        <Button
                            className="hidden"
                            startContent={<Icon className="text-default-500" icon="fe:github" width={24} />}
                            variant="bordered"
                        >
                            Continue with Github
                        </Button>
                    </div>
                    <p className="text-center text-small">
                        Need to create an account?&nbsp;
                        <Link href="#" size="sm">
                            Sign Up
                        </Link>
                    </p>
                </CardBody>
            </Card>
        </div>
    )
}
