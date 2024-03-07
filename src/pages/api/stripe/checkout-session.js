const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
import applyRateLimit from '@/utils/apply-rate-limit'
import { createClient } from '@/utils/supabase/api'
import { runMiddleware } from '@/utils/utils'

import Cors from "cors"
const cors = Cors()

export default async function handler(req, res) {
    await applyRateLimit(req, res)
    await runMiddleware(req, res, cors)

    if (req.method === 'POST') {
        const supabase = createClient(req, res)
        const { price, metadata, customer_name } = req.body

        // Authorize the user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return res.status(404).json({ error: 'Not Found' })

        // Try to load the customer
        const stripeCustomer = await stripe.customers.search({
            query: `metadata['supabase_uuid']:'${user.id}'`,
        }).then(res => res.data[0])

        let customerId = stripeCustomer?.id

        // Create customer if not found
        if (!stripeCustomer) {
            const customerData = {
                email: user.email,
                name: customer_name,
                metadata: {
                    supabase_uuid: user.id
                }
            }

            const customer = await stripe.customers.create(customerData)

            if (!customer) return res.status(404).json({ error: 'Not Found' })

            customerId = customer.id
        }

        try {
            // Create Checkout Sessions from body params.
            const session = await stripe.checkout.sessions.create({
                customer: customerId,
                line_items: [
                    {
                        price: price.id,
                        quantity: 1,
                    },
                ],
                allow_promotion_codes: true,
                mode: 'subscription',
                success_url: `${req.headers.origin}/user/${user?.id}?success=true`,
                cancel_url: `${req.headers.origin}/products?canceled=true`,
                subscription_data: {
                    metadata: {
                        supabase_uuid: user.id,
                        ...metadata
                    }
                    // trial_period_days: 7,
                },
                // customer_email: 'customer@example.com',
                // submit_type: 'donate',
                // billing_address_collection: 'auto',
                /*
                shipping_address_collection: {
                    allowed_countries: ['US', 'CA'],
                },
                */
            })

            res.json({ session })
        } catch (err) {
            console.error(err)
            res.status(err.statusCode || 500).json(err.message)
        }
    } else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method Not Allowed')
    }
}