
import React from "react";
import { Link, Spacer } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import Logo from "./logo";
import { motion } from "framer-motion";

const navLinks = [
    {
        name: "Home",
        href: "#",
    },
    {
        name: "About",
        href: "#",
    },
    {
        name: "Services",
        href: "#",
    },
    {
        name: "Projects",
        href: "#",
    },
    {
        name: "Contact",
        href: "#",
    },
    {
        name: "Blog",
        href: "#",
    },
    {
        name: "Careers",
        href: "#",
    },
];

const socialItems = [
    {
        name: "Facebook",
        href: "https://facebook.com",
        icon: (props) => <Icon {...props} icon="fontisto:facebook" />,
    },
    {
        name: "Instagram",
        href: "https://instagram.com",
        icon: (props) => <Icon {...props} icon="fontisto:instagram" />,
    },
    {
        name: "Twitter",
        href: "https://twitter.com",
        icon: (props) => <Icon {...props} icon="fontisto:twitter" />,
    },
    {
        name: "GitHub",
        href: "https://github.com",
        icon: (props) => <Icon {...props} icon="fontisto:github" />,
    },
    {
        name: "YouTube",
        href: "https://youtube.com",
        icon: (props) => <Icon {...props} icon="fontisto:youtube-play" />,
    },
];

const siteName = process.env.NEXT_PUBLIC_SITE_NAME

export default function NewFooter() {
    return (
        <footer className="flex w-full flex-col">
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center p-6 md:p-8">
                <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.01, 1], transition: { repeat: Infinity, duration: 2 } }}
                    style={{
                        position: 'relative',
                        display: 'inline-block',
                        filter: 'drop-shadow(0 0 8px rgba(255, 100, 0, 0.8)) drop-shadow(0 0 15px rgba(255, 150, 0, 0.6))',
                    }}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Logo />

                        <span className="text-medium font-medium">
                            {siteName}
                        </span>
                    </div>

                    {Array.from({ length: 15 }).map((_, index) => (
                        <motion.div
                            suppressHydrationWarning
                            key={index}
                            initial={{ opacity: 0, x: Math.random() * 20 - 10, y: Math.random() * 20 - 10 }}
                            animate={{
                                opacity: [0, 1, 0],
                                x: [null, Math.random() * 100 - 50, Math.random() * 200 - 100],
                                y: [null, Math.random() * 100 - 50, Math.random() * 200 - 100],
                                scale: [1, 0.5, 0],
                                transition: { duration: Math.random() + 4, repeat: Infinity, ease: "linear" },
                            }}
                            style={{
                                position: 'fixed',
                                width: 4,
                                height: 4,
                                backgroundColor: ['red', 'orange', 'yellow'][Math.floor(Math.random() * 3)],
                                borderRadius: '50%',
                                top: '50%',
                                left: '50%',
                            }}
                        />
                    ))}
                </motion.div>

                <Spacer y={4} className="hidden" />

                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 hidden">
                    {navLinks.map((item) => (
                        <Link
                            key={item.name}
                            isExternal
                            className="text-default-500"
                            href={item.href}
                            size="sm"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <Spacer y={6} />

                <div className="flex justify-center gap-x-4">
                    {socialItems.map((item) => (
                        <Link key={item.name} isExternal className="text-default-400" href={item.href}>
                            <span className="sr-only">
                                {item.name}
                            </span>

                            <item.icon aria-hidden="true" className="w-5" />
                        </Link>
                    ))}
                </div>

                <Spacer y={4} />

                <p className="mt-1 text-center text-small text-default-400">
                    &copy; 2024 {siteName}. All rights reserved.
                </p>
            </div>
        </footer>
    );
}