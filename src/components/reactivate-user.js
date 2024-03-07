import { useSession } from "@supabase/auth-helpers-react"
import { useEffect, useState } from "react"
import { useSWRConfig } from "swr"
import { useCache } from "./cache-provider"
import { patchAPI } from "@/utils/utils"

export default () => {
    const session = useSession()
    const { data: user } = useCache(session ? '/api/users/me' : null)
    const { mutate } = useSWRConfig()
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        if (user?.deactivated) {
            if (checked) return
            setChecked(true)

            patchAPI(session, '/api/users/me', { deactivated: false })
                .catch((error) => console.error(error))
                .finally(() => {
                    mutate('/api/users/me')
                    mutate('/api/users')
                })
        } else {
            setChecked(false)
        }
    }, [user])
}