import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { PostgrestFilterBuilder } from "@supabase/postgrest-js"
import { createQueries } from "entities.generated"
import { HTTP_METHOD } from "next/dist/server/web/http"
import { useCallback, useEffect } from "react"
import useSWR, { SWRConfiguration, useSWRConfig } from "swr"

export interface QueryFilters {
    [key: string]: any
}

export type SupabaseQuery = PostgrestFilterBuilder<any, any, any>

export interface Entity {
    id: string
    [key: string]: any
}

const amendEntity = (currentData: Entity[], entity: Entity) => {
    const index = currentData.findIndex((d) => d.id == entity.id)

    if (index > -1) {
        const newData = [...currentData]
        newData[index] = { ...newData[index], ...entity }
        return newData
    }

    return currentData
}

export function useEntities<T extends Entity[]>(
    table?: string | null,
    filters?: QueryFilters | null,
    config?: SWRConfiguration | null
) {
    const supabase = useSupabaseClient()
    const query = table ? (createQueries() as any)[table] : null
    const swr = useSupabaseSWR<T>(table, query, filters, config)
    const { mutate } = swr

    const swrConfig = useSWRConfig()

    const update = useCallback(async (id: string, values: Partial<T[0]>) => {
        mutate(async () => {
            if (!table) throw new Error('Table is required')

            const updateQuery = supabase.from(table).update(values)
                .eq('id', id).select()

            const { data, error } = await updateQuery

            if (error) {
                swrConfig.onError(error, table, swrConfig)
                throw error
            }

            return data as T
        }, {
            populateCache: (result, currentData) => {
                if (!currentData) return result
                if (!(result as Entity[]).length) return currentData

                const newData = amendEntity(currentData as Entity[], (result as Entity[])[0] as Entity)
                return newData as T
            },
            optimisticData(currentData) {
                if (!currentData) []

                const newData = amendEntity(currentData as Entity[], { id, ...values })
                return newData as T
            },
            revalidate: false
        })
    }, [mutate])
    // TODO mutate for update, insert, delete
    // TODO cache propagation on data change

    return { ...swr, update }
}

export function useEntity<T extends Entity[]>(
    table?: string | null,
    id?: string | null,
    filters?: QueryFilters | null,
    config?: SWRConfiguration | null
) {
    const swr = useEntities<T>(table, id ? { id, ...filters } : { ...filters, limit: 1 }, config)
    return { ...swr, data: swr.data?.[0] as T[0] }
}

export function useSupabaseSWR<T = Entity[]>(
    table?: string | null,
    query?: SupabaseQuery | null,
    filters?: QueryFilters | null,
    config?: SWRConfiguration | null
) {
    const { cache, mutate } = useSWRConfig()

    if (query && filters) applyFilters(query, filters)

    const queryJson: { method: HTTP_METHOD, url: string } = JSON.parse(JSON.stringify(query))
    const queryPath = queryJson?.url.split("/rest/v1/")[1]
    const swrKey = queryPath ? `entities:${queryPath}` : null

    const swr = useSWR<T>(
        swrKey,
        async () => await query!.throwOnError().then(({ data }) => data),
        config || undefined
    )

    const { data } = swr as { data: Entity[] | undefined }

    useEffect(() => {
        if (!data) return

        // populate cache
        for (const key of cache.keys()) {
            if (key == swrKey) continue
            if (!key.startsWith('entities:')) continue
            if (key.replace('entities:', '').split('?')[0] != table) continue

            const { data: cacheData } = cache.get(key)! as { data: Entity[] }
            if (!cacheData) continue

            // compare cacheData and data for any changes to individual entities
            let newData = [...cacheData]

            for (const entity of newData) {
                const currentEntity = data.find((d) => d.id === entity.id)
                if (currentEntity && JSON.stringify(currentEntity) != JSON.stringify(entity)) {
                    newData = amendEntity(newData, currentEntity)
                }
            }

            if (JSON.stringify(newData) != JSON.stringify(cacheData)) {
                mutate(key, newData, false)
            }
        }
    }, [data])

    return swr
}

function applyFilters(
    query: SupabaseQuery,
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

