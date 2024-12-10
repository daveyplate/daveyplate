import { useState } from "react"
import { useRouter } from "next/router"
import { useSession } from '@supabase/auth-helpers-react'

import { AutoTranslate } from 'next-auto-translate'
import { useAPI, useEntity } from "@daveyplate/supabase-swr-entities/client"

import { Button, Card, CardBody, CardHeader, Divider } from "@nextui-org/react"
import { toast } from "sonner"

import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { isExport } from "@/utils/utils"
import { GetStaticPropsContext } from "next"

export default function Products(
    { products, prices }: { products: Record<string, any>[], prices: Record<string, any>[] }
) {
    const router = useRouter()
    const session = useSession()
    const { entity: user } = useEntity(session ? 'profiles' : null, 'me')
    const { postAPI } = useAPI()

    const [priceIdLoading, setPriceIdLoading] = useState(null)

    const handleCheckout = async (product: Record<string, any>, price: Record<string, any>) => {
        // Redirect to login if user is not logged in
        if (!user) {
            return router.push("/login?returnTo=/products", "/login")
        }

        setPriceIdLoading(price.id)

        // Create a new checkout session and redirect to Stripe Checkout
        const { data: { session } } = await postAPI('/api/stripe/checkout-session',
            {
                price,
                metadata: product.metadata,
                customer_name: user?.full_name
            }
        )

        if (session) {
            router.push(session.url)
        } else {
            setPriceIdLoading(null)

            toast.error('Error creating checkout session')
        }
    }

    return (
        <div className="flex-container flex-center">
            <h2 className="hidden sm:block">
                <AutoTranslate tKey="title">
                    Products
                </AutoTranslate>
            </h2>

            {products?.map((product, index) => (
                <Card key={index}>
                    <CardHeader className="justify-center p-4">
                        <h3>
                            <AutoTranslate tKey={product.id + "-name"}>
                                {product.name}
                            </AutoTranslate>
                        </h3>
                    </CardHeader>

                    <Divider />

                    <CardBody className="gap-4 items-center p-5">
                        <p>
                            <AutoTranslate tKey={product.id + "-description"}>
                                {product.description}
                            </AutoTranslate>
                        </p>

                        <div className="flex gap-4">
                            {prices.sort((p1, p2) => p1.unit_amount - p2.unit_amount).filter(price => price.product == product.id).map((price, index) => (
                                <Button
                                    key={index}
                                    color="primary"
                                    size="lg"
                                    disabled={priceIdLoading == price.id}
                                    onPress={() => handleCheckout(product, price)}
                                    isLoading={priceIdLoading == price.id}
                                >
                                    {(price.unit_amount / 100).toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: price.currency,
                                    })} /{' '}

                                    <AutoTranslate tKey={price.recurring.interval + "-interval"}>
                                        {price.recurring.interval}
                                    </AutoTranslate>
                                </Button>
                            ))}
                        </div>
                    </CardBody>
                </Card>)
            )}
        </div>
    )
}

export async function getStaticProps({ locale, params }: GetStaticPropsContext) {
    const translationProps = await getTranslationProps({ locale, params })

    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

    // const products = await stripe.products.list().then(res => res.data)
    // const prices = await stripe.prices.list().then(res => res.data)

    const products: Record<string, any>[] = []
    const prices: Record<string, any>[] = []
    return {
        props: {
            ...translationProps,
            products,
            prices,
        },
        // revalidate: isExport() ? undefined : 60 * 10
        // TODO on demand revalidation? https://nextjs.org/docs/pages/building-your-application/data-fetching/incremental-static-regeneration#on-demand-revalidation
    }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined