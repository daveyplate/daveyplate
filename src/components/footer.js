import React from "react"
import { motion } from "framer-motion"

import LocaleDropdown from "@/components/locale-dropdown"

export default function Footer() {
    // Get the current year:
    const year = new Date().getFullYear()

    return (
        <footer className="backdrop-blur-xl bg-background/70 fixed w-full bottom-0 z-20 pb-safe">
            <div className="flex justify-center items-center py-2 gap-2 overflow-hidden h-16">
                <LocaleDropdown isIconOnly variant="light" />

                <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.01, 1], transition: { repeat: Infinity, duration: 2 } }}
                    style={{
                        position: 'relative',
                        display: 'inline-block',
                        filter: 'drop-shadow(0 0 8px rgba(255, 100, 0, 0.8)) drop-shadow(0 0 15px rgba(255, 150, 0, 0.6))',
                    }}
                >
                    <p className="text-foreground/80">
                        © {year} Daveyplate
                    </p>

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
            </div>
        </footer>
    )
}