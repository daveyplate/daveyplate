import { useAPI } from "@daveyplate/supabase-swr-entities/client"
import { PostgrestFilterBuilder } from "@supabase/postgrest-js"
import { HTTP_METHOD } from "next/dist/server/web/http"
import useSWR, { SWRConfiguration } from "swr"
import { createQueries } from "./entities-provider"

export type QueryFilters = Record<string, unknown>

export function useEntities<T = any>(
    table?: string | null,
    filters?: QueryFilters | null,
    config?: SWRConfiguration | null
) {
    const query = table ? (createQueries() as any)[table] : null
    const swr = useSupabaseSWR<T[]>(query, filters, config)

    // TODO mutate for update, insert, delete
    // TODO cache propagation on data change

    return { ...swr }
}

export function useEntity<T = any>(
    table?: string | null,
    id?: string | null,
    filters?: QueryFilters | null,
    config?: SWRConfiguration | null
) {
    const swr = useEntities<T>(table, id ? { id, ...filters } : { ...filters, limit: 1 }, config)
    return { ...swr, data: swr.data?.[0] }
}

export function useSupabaseSWR<T>(
    query?: PostgrestFilterBuilder<any, any, any> | null,
    filters?: QueryFilters | null,
    config?: SWRConfiguration | null
) {
    if (query && filters) applyFilters(query, filters)

    const queryJson: { method: HTTP_METHOD, url: string } = JSON.parse(JSON.stringify(query))
    const queryPath = queryJson?.url.split("/rest/v1/")[1]

    return useSWR<T>(
        queryPath,
        async () => await query!.throwOnError().then(({ data }) => data),
        config || undefined
    )
}

function applyFilters(
    query: PostgrestFilterBuilder<any, any, any>,
    filters: QueryFilters
) {
    for (const [key, value] of Object.entries(filters)) {
        if (['offset', 'order'].includes(key)) continue

        if (key == 'limit') {
            query.limit(value as number)
        } else if (key == 'or') {
            query.or(value as string)
        } else if (key.endsWith('_neq')) {
            query.neq(key.slice(0, -4), value)
        } else if (key.endsWith('_in')) {
            query.in(key.slice(0, -3), (value as string).split(','))
        } else if (key.endsWith('_like')) {
            query.ilike(key.slice(0, -5), `%${value}%`)
        } else if (key.endsWith('_ilike')) {
            query.ilike(key.slice(0, -6), `%${value}%`)
        } else if (key.endsWith('_search')) {
            query.textSearch(key.slice(0, -7), `'${value}'`, { type: 'websearch' })
        } else if (key.endsWith('_gt')) {
            query.gt(key.slice(0, -3), value)
        } else if (key.endsWith('_lt')) {
            query.lt(key.slice(0, -3), value)
        } else if (key.endsWith('_gte')) {
            query.gte(key.slice(0, -3), value)
        } else if (key.endsWith('_lte')) {
            query.lte(key.slice(0, -3), value)
        } else if (value == "null" || value == null) {
            query.is(key, null)
        } else {
            query.eq(key, value)
        }
    }
}

