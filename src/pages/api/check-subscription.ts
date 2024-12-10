import Stripe from "stripe"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

import { createClient } from '@/utils/supabase/api'
import { createClient as createAdminClient } from '@/utils/supabase/service-role'
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const supabase = createClient(req, res)

        // Auth check
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return res.status(404).json({ error: 'Not Found' })

        // Find the customer from Stripe
        const { data: stripeSubscriptions } = await stripe.subscriptions.search({
            query: `metadata['supabase_uuid']:'${user.id}'`,
        })

        if (stripeSubscriptions) {
            for (const subscription of stripeSubscriptions) {
                if (subscription.status == 'active' || subscription.status == 'trialing') {
                    // Update the user's subscription status
                    const supabaseAdmin = createAdminClient()
                    const userClaim = subscription.metadata.user_claim

                    const { error } = await supabaseAdmin.auth.admin.updateUserById(
                        user.id,
                        {
                            app_metadata: {
                                claims: {
                                    ...user.app_metadata.claims,
                                    [userClaim]: (subscription.status == 'active' || subscription.status == 'trialing')
                                }
                            }
                        }
                    )

                    if (error) {
                        throw new Error('Failed to update user claims')
                    }

                    return res.status(200).json({ active: true })
                }
            }

            return res.status(404).json({ error: 'Not Found' })
        } else {
            return res.status(404).json({ error: 'Not Found' })
        }
    } else {
        return res.status(404).json({ error: 'Not Found' })
    }
}