import { useAPI } from "@daveyplate/supabase-swr-entities/client"
import { PostgrestFilterBuilder } from "@supabase/postgrest-js"
import { HTTP_METHOD } from "next/dist/server/web/http"
import useSWR, { SWRConfiguration } from "swr"
import { createQueries } from "./entities-provider"

export type QueryFilters = Record<string, unknown>

export function useEntities<T>(
    table?: string | null,
    filters?: QueryFilters | null,
    config?: SWRConfiguration | null
) {

    const query = table ? (createQueries() as any)[table] : null
    const swr = useSupabaseSWR<T[]>(query, filters, config)

    return { ...swr }
}

export function useEntity<T>(
    table?: string | null,
    id?: string | null,
    filters?: QueryFilters | null,
    config?: SWRConfiguration | null
) {
    const swr = useEntities<T>(table, id ? { id, ...filters } : filters, config)

    console.log("filters", filters)
    return { ...swr, data: swr.data?.[0] }
}

export function useSupabaseSWR<T>(
    query?: PostgrestFilterBuilder<any, any, any> | null,
    filters?: QueryFilters | null,
    config?: SWRConfiguration | null
) {
    const { getAPI } = useAPI()
    if (query && filters) applyFilters(query, filters)

    const queryJson: { method: HTTP_METHOD, url: string } = JSON.parse(JSON.stringify(query))
    const queryPath = queryJson?.url.split("/rest/v1/")[1]

    return useSWR<T>(
        queryPath,
        async () => {
            console.log("queryPath", queryPath)
            return await query!.throwOnError().then(({ data }) => data)

            // return await getAPI(`/api/rest/v1/${queryPath}`) as T
        },
        config || undefined
    )
}

function applyFilters(
    query: PostgrestFilterBuilder<any, any, any>,
    filters: QueryFilters
) {
    for (const [key, value] of Object.entries(filters)) {
        if (['limit', 'offset', 'order'].includes(key)) continue

        if (key == 'or') {
            query = query.or(value as string)
        } else if (key.endsWith('_neq')) {
            query = query.neq(key.slice(0, -4), value)
        } else if (key.endsWith('_in')) {
            query = query.in(key.slice(0, -3), (value as string).split(','))
        } else if (key.endsWith('_like')) {
            query = query.ilike(key.slice(0, -5), `%${value}%`)
        } else if (key.endsWith('_ilike')) {
            query = query.ilike(key.slice(0, -6), `%${value}%`)
        } else if (key.endsWith('_search')) {
            query = query.textSearch(key.slice(0, -7), `'${value}'`, { type: 'websearch' })
        } else if (key.endsWith('_gt')) {
            query = query.gt(key.slice(0, -3), value)
        } else if (key.endsWith('_lt')) {
            query = query.lt(key.slice(0, -3), value)
        } else if (key.endsWith('_gte')) {
            query = query.gte(key.slice(0, -3), value)
        } else if (key.endsWith('_lte')) {
            query = query.lte(key.slice(0, -3), value)
        } else if (value == "null" || value == null) {
            query = query.is(key, null)
        } else {
            query = query.eq(key, value)
        }
    }
}

