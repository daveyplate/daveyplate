import { buffer } from "micro"
import Stripe from "stripe"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const relevantEvents = new Set([
    //'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted'
])
import { createClient } from '@/utils/supabase/service-role'
import { NextApiRequest, NextApiResponse } from "next"

export const config = { api: { bodyParser: false } }

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const body = await buffer(req)
    const sig = req.headers["stripe-signature"]

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    let event

    try {
        if (!sig || !webhookSecret) return
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (error) {
        console.error(`❌ Error message: ${(error as Error).message}`)
        res.status(400).end(`Webhook Error: ${(error as Error).message}`)
    }

    const supabase = createClient()

    if (event && relevantEvents.has(event.type)) {
        try {
            switch (event.type) {
                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted':
                    const receivedSubscription = event.data.object

                    const subscription = await stripe.subscriptions.retrieve(
                        receivedSubscription.id
                    )

                    if (!subscription) {
                        throw new Error('Failed to retrieve subscription')
                    }

                    // Update the user claim
                    const userId = subscription.metadata.supabase_uuid
                    const userClaim = subscription.metadata.user_claim

                    const { data: { user } } = await supabase.auth.admin.getUserById(userId)
                    if (!user) {
                        throw new Error('Failed to retrieve user')
                    }

                    const { error } = await supabase.auth.admin.updateUserById(
                        userId,
                        { app_metadata: { claims: { ...user.app_metadata.claims, [userClaim]: (subscription.status == 'active' || subscription.status == 'trialing') } } }
                    )

                    if (error) {
                        throw new Error('Failed to update user claims')
                    }

                    break
                case 'checkout.session.completed':
                    /*
                    const checkoutSession = event.data.object
                    if (checkoutSession.mode === 'subscription') {
                        const subscriptionId = checkoutSession.subscription
                        await manageSubscriptionStatusChange(
                            subscriptionId,
                            checkoutSession.customer,
                            true
                        )
                    }
                    */
                    break
                default:
                    throw new Error('Unhandled relevant event!')
            }
        } catch (error) {
            console.error(error)
            res.status(400).end('Webhook handler failed. View your nextjs function logs.')
        }
    }

    res.json({ received: true })
}
