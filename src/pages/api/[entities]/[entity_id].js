import { entityRoute } from '@daveyplate/supabase-swr-entities/server'
import { createClient } from '@/utils/supabase/api'

export default async (req, res) => {
  const supabase = createClient(req, res)

  const { status, body } = await entityRoute({
    supabase,
    ...req
  })

  res.status(status).json(body)
}