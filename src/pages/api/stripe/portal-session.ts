import Stripe from "stripe"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

import { createClient } from '@/utils/supabase/api'
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const supabase = createClient(req, res)

        // Authorize the user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return res.status(404).json({ error: 'Not Found' })

        // Find the customer from Stripe
        const stripeCustomer = await stripe.customers.search({
            query: `metadata['supabase_uuid']:'${user.id}'`,
        }).then(res => res.data[0])

        if (!stripeCustomer) {
            return res.status(404).json({ error: 'Not Found' })
        }

        // Create a new session for the billing portal
        const session = await stripe.billingPortal.sessions.create({
            customer: stripeCustomer.id,
            return_url: `${req.headers.origin}/settings`,
        })

        if (session) {
            return res.status(200).json({ url: session.url })
        } else {
            return res.status(404).json({ error: 'Not Found' })
        }
    }
}