
import { useEffect } from "react"
import { useRouter } from "next/router"
import { useSession } from "@supabase/auth-helpers-react"

import { useCache } from "@/components/cache-provider"
import { postAPI } from "@/utils/utils"

import { toast } from "@/components/toast-provider"

// The key purpose is to ensure that the user's subscription status is checked after a successful order
export default function CheckoutStatus() {
    const router = useRouter()
    const session = useSession()
    const { data: user, mutate } = useCache(session ? '/api/users/me' : null)

    useEffect(() => {
        if (router.query.success) {
            toast('Order placed!')

            if (user && !user.claims?.premium) {
                // Check subscription status
                postAPI('/api/check-subscription')
                    .then(res => {
                        if (res.data.active) {
                            toast('Subscription active!', { color: 'success' })
                            mutate()
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
    }, [router.query])
}