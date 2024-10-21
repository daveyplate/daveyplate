import { motion } from 'framer-motion'
import { AutoTranslate } from 'next-auto-translate'

import { getStaticPaths as getExportStaticPaths } from "@/utils/get-static"
import { getTranslationProps } from '@/utils/translation-props'
import { isExport } from "@/utils/utils"

import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react"

const PulseGreen = ({ children, className }) => {
    return (
        <motion.div
            className={className}
            initial={{ scale: 0.99 }}
            animate={{ scale: 1.01 }}
            transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 0.6 * 2,
                ease: "easeInOut"
            }}
            style={{
                display: 'inline-block',
                background: 'rgba(0, 255, 0, 0.2)',
                boxShadow: '0 0 8px rgba(0, 255, 0, 0.5)',
            }}
        >
            {children}
        </motion.div>
    )
}

export default function Home() {
    return (
        <div className="flex-center max-w-2xl">
            <h1>
                <AutoTranslate tKey="title">
                    Welcome to Daveyplate
                </AutoTranslate>
            </h1>

            <PulseGreen className="rounded-2xl">
                <Card className="bg-opacity-90">
                    <CardHeader className="p-5">
                        <h3>
                            <AutoTranslate tKey="heading">
                                Next.js Boilerplate
                            </AutoTranslate>
                        </h3>
                    </CardHeader>

                    <Divider />

                    <CardBody className="gap-4 p-5">
                        <p>
                            <AutoTranslate tKey="description_1">
                                Simple user management system built with Next.js, NextUI, and Supabase.
                            </AutoTranslate>
                        </p>

                        <p>
                            <AutoTranslate tKey="description_2">
                                NextJS Page Router to create a simple navigation system.
                                Stripe to accept payments and synchronize subscriptions & products.
                            </AutoTranslate>
                        </p>
                    </CardBody>
                </Card>
            </PulseGreen>
        </div>
    )
}

export async function getStaticProps({ locale, ...context }) {
    const translationProps = await getTranslationProps({ locale, ...context })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getExportStaticPaths : undefined