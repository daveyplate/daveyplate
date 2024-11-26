import { useEffect, useState } from "react"
import { Button, Input, Link, Divider, Card, CardBody, cn, CardHeader, CardFooter } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useRouter } from "next/router"

const authProviders = {
    apple: {
        name: "Apple",
        icon: <Icon className="text-default-500" icon="fa:apple" width={18} />,
    },
    discord: {
        name: "Discord",
        icon: <Icon icon="logos:discord-icon" width={25} />,
    },
    facebook: {
        name: "Facebook",
        icon: <Icon icon="logos:facebook" width={23} />,
    },
    google: {
        name: "Google",
        icon: <Icon icon="flat-color-icons:google" width={24} />,
    },
    github: {
        name: "GitHub",
        icon: <Icon className="text-default-500" icon="fe:github" width={27} />,
    },
    email: {
        name: "Email",
        icon: <Icon className="text-2xl" icon="solar:letter-bold" />
    },
    password: {
        name: "Password",
        icon: <Icon className="text-xl" icon="solar:lock-keyhole-bold" />
    }
}

const viewTitles = {
    login: "Log In",
    signup: "Sign Up",
    "forgot-password": "Forgot Password",
    "magic-link": "Email"
}

const viewActions = {
    login: "Log In",
    signup: "Sign Up",
    "forgot-password": "Reset Password",
    "magic-link": "Continue with Email"
}

export default function LoginPage({ magicLink = true, nextRouter = true, initialView = "login" }) {
    const router = useRouter()
    const [view, setView] = useState(nextRouter ? router.pathname.split("/")[1] : initialView)
    const providers = ["google", "facebook", "apple", "github"]

    useEffect(() => {
        if (nextRouter && view != router.pathname.split("/")[1]) {
            setView(router.pathname.split("/")[1])
        }
    }, [router.pathname])

    useEffect(() => {
        if (nextRouter && view != router.pathname.split("/")[1]) {
            router.push(`/${view}`)
        }
    }, [view])

    return (
        <div className="flex flex-col grow items-center justify-center p-4 gap-4">
            <Card fullWidth className="max-w-sm p-2">
                <CardHeader className="px-4">
                    <p className="text-xl font-medium">
                        {viewTitles[view]}
                    </p>
                </CardHeader>

                <CardBody className="gap-4">
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
                                ["login", "signup"].includes(view) ? "opacity-1" : "opacity-0 -mt-3 !h-0 overflow-hidden",
                                "transition-all"
                            )}
                            label="Password"
                            name="password"
                            type="password"
                            variant="bordered"
                        />

                        <Button color="primary" type="submit">
                            {viewActions[view]}
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
                        {magicLink && view != "magic-link" && (
                            <Button
                                startContent={
                                    authProviders.email.icon
                                }
                                variant="flat"
                                onPress={() => setView("magic-link")}
                            >
                                Continue with Email
                            </Button>
                        )}

                        {view == "magic-link" && (
                            <Button
                                startContent={
                                    authProviders.password.icon
                                }
                                variant="flat"
                                onPress={() => setView("login")}
                            >
                                Continue with Password
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
                            <div className="flex gap-2">
                                {providers?.map((provider) => (
                                    <Button
                                        key={provider}
                                        variant="flat"
                                        className="min-w-0"
                                        fullWidth
                                    >
                                        {authProviders[provider].icon}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </CardBody>

                <CardFooter className="flex-col">
                    <p className={cn(
                        ["login", "magic-link"].includes(view) ? "opacity-1" : "opacity-0 translate-y-3 h-0 overflow-hidden",
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
                        ["signup", "forgot-password"].includes(view) ? "opacity-1" : "opacity-0 translate-y-3 h-0 overflow-hidden",
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
                </CardFooter>
            </Card>

            <p className="text-center text-small text-default-400">
                By continuing, you agree to our <a href="/terms" className="underline">Terms</a> & <a href="/privacy" className="underline">Privacy</a>.
            </p>
        </div>
    )
}
