import { createClient } from '@/utils/supabase/api'
import { createClient as createAdminClient } from '@/utils/supabase/service-role'

import applyRateLimit from '@/utils/apply-rate-limit'
import { runMiddleware } from '@/utils/utils'

import Cors from "cors"
const cors = Cors()

export default async (req, res) => {
    await applyRateLimit(req, res)
    await runMiddleware(req, res, cors)

    // Authorize the user
    const supabase = createClient(req, res)
    const { data: { user: sessionUser } } = await supabase.auth.getUser()

    if (!sessionUser) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    const supabaseAdmin = createAdminClient()

    if (req.method == 'GET') {
        // Get entire user object for self
        const { data: user, error } = await supabaseAdmin.from('users').select('*').eq('id', sessionUser.id).single()

        if (error) {
            console.error(error)
            return res.status(500).json({ error: error.message })
        }

        res.json(user)
    } else if (req.method == 'PATCH') {
        const { name, ...params } = req.body

        // Update name as full_name in user_metadata
        if (name) {
            const { error } = await supabaseAdmin.auth.admin.updateUserById(sessionUser.id, { user_metadata: { full_name: name } })

            if (error) {
                console.error(error)
                return res.status(500).json({ error: error.message })
            }
        }

        // Update other profile fields
        if (params) {
            const allowedParams = ['bio', 'deactivated']

            for (const key in params) {
                if (!allowedParams.includes(key)) {
                    return res.status(400).json({ error: 'Invalid parameter' })
                }
            }

            const { error } = await supabaseAdmin.from('profiles')
                .update(params)
                .eq('id', sessionUser.id)

            if (error) {
                console.error(error)
                return res.status(500).json({ error: error.message })
            }
        }

        res.revalidate(`/users`)
        res.revalidate(`/user/${sessionUser.id}`)

        res.json({ success: true })
    } else if (req.method == 'DELETE') {
        // Add the user to the deleted_users table
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .single()

        if (profile) {
            const { error } = await supabaseAdmin.from('deleted_users').insert(
                {
                    id: profile.id,
                    email: sessionUser.email,
                    full_name: sessionUser.user_metadata.full_name,
                    avatar_url: sessionUser.user_metadata.avatar_url
                }
            )

            if (error) console.error(error)
        }

        // Delete the user from the auth.users table which will also cascade delete from profiles
        const { error: deletionError } = await supabaseAdmin.auth.admin.deleteUser(
            sessionUser.id
        )

        if (deletionError) {
            console.error(deletionError)
            return res.status(500).json({ error: deletionError.message })
        }

        res.status(204).end()
    } else {
        res.status(405).end({ error: 'Method Not Allowed' })
    }
}