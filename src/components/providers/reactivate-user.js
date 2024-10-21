import { useEffect, useState } from "react"
import { useSession } from "@supabase/auth-helpers-react"

import { useEntity } from "@daveyplate/supabase-swr-entities"

export default () => {
    const session = useSession()
    const { entity: user, updateEntity: updateUser } = useEntity(session ? 'profiles' : null, 'me')
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        if (user?.deactivated) {
            if (checked) return
            setChecked(true)

            updateUser({ deactivated: false })
        } else {
            setChecked(false)
        }
    }, [user])
}