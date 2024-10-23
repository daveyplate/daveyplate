
import { useEffect } from "react"
import { useRouter } from "next/router"
import { useSession } from "@supabase/auth-helpers-react"

import { postAPI, useEntity } from "@daveyplate/supabase-swr-entities/client"
import { toast } from "@/components/providers/toast-provider"

// The key purpose is to ensure that the user's subscription status is checked after a successful order
export default function CheckoutStatus() {
    // TODO FIX postAPI missing session here
    const router = useRouter()
    const session = useSession()
    const { entity: user, mutate: mutateUser } = useEntity(session ? 'profiles' : null, 'me')

    useEffect(() => {
        if (router.query.success && user) {
            toast('Order placed!')

            if (!user.premium) {
                // Check subscription status
                postAPI(session, '/api/check-subscription')
                    .then(res => {
                        if (res.data.active) {
                            toast('Subscription active!', { color: 'success' })
                            mutateUser()
                        }
                    })
                    .catch(err => {
                        console.error(err)
                    })
            } else {
                toast('Subscription active!', { color: 'success' })
            }
        }

        if (router.query.canceled) {
            toast('Order canceled')
        }
    }, [router.query, user])
}