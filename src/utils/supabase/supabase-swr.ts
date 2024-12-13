import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { PostgrestFilterBuilder } from "@supabase/postgrest-js"
import { createQueries } from "entities.generated"
import { HTTP_METHOD } from "next/dist/server/web/http"
import { useCallback, useEffect } from "react"
import useSWR, { SWRConfiguration, useSWRConfig } from "swr"

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

export function useEntities<T extends Entity>(
    table?: string | null,
    filters?: QueryFilters<T> | null,
    config?: SWRConfiguration | null
) {
    const supabase = useSupabaseClient()
    // TODO pass <Database> to the provider? and inherit type here somehow?
    const query = table ? (createQueries() as any)[table] : null
    const select = query.url.searchParams.get("select") as string || "*"

    const swr = useSupabaseSWR<T>(table, query, filters, config)
    const { mutate } = swr

    const swrConfig = useSWRConfig()


    const update = useCallback(async (id: string, values: Partial<T>) => {
        mutate(async () => {
            if (!table) throw new Error('Table is required')

            const updateQuery = supabase.from(table).update(values)
                .eq('id', id).select(select) as unknown as SupabaseQuery

            const { data, error } = await updateQuery

            if (error) {
                swrConfig.onError(error, table, swrConfig)
                throw error
            }

            return data as T[]
        }, {
            populateCache: (result, currentData) => {
                if (!currentData?.length) return result
                if (!result.length) return currentData

                const newData = amendEntity(currentData, result[0])
                return newData as T[]
            },
            optimisticData(currentData) {
                if (!currentData) return []

                const newData = amendEntity(currentData, { id, ...values })
                return newData as T[]
            },
            revalidate: false
        })
    }, [mutate])

    // TODO INFINITE !
    // TODO mutate for insert, delete

    return { ...swr, update }
}

export function useEntity<T extends Entity>(
    table?: string | null,
    id?: string | null,
    filters?: QueryFilters<T> | null,
    config?: SWRConfiguration | null
) {
    const swr = useEntities<T>(table, id ? { id, ...filters } : { ...filters, limit: 1 } as any, config)
    return { ...swr, data: swr.data?.[0] }
}

export function useSupabaseSWR<T extends Entity>(
    table?: string | null,
    query?: SupabaseQuery | null,
    filters?: QueryFilters<T> | null,
    config?: SWRConfiguration | null
) {
    const { cache, mutate } = useSWRConfig()

    if (query && filters) applyFilters<T>(query, filters)

    const queryJson: { method: HTTP_METHOD, url: string } = JSON.parse(JSON.stringify(query))
    const queryPath = queryJson?.url.split("/rest/v1/")[1]
    const swrKey = queryPath ? `entities:${queryPath}` : null

    const swr = useSWR<T[]>(
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

function applyFilters<T extends Entity>(
    query: SupabaseQuery,
    filters: QueryFilters<T>
) {
    for (const [key, value] of Object.entries(filters)) {
        if (key in ["limit", "offset", "order", "or", "match"]) continue

        if (value == null) {
            query.is(key, null)
            continue
        }

        if (typeof value != "object") {
            query.eq(key, value)
            continue
        }

        const columnFilter = value as ColumnFilters<T[keyof T]>

        if (columnFilter.eq) {
            query.eq(key, columnFilter.eq)
        } else if (columnFilter.neq) {
            query.neq(key, columnFilter.neq)
        } else if (columnFilter.gt) {
            query.gt(key, columnFilter.gt)
        } else if (columnFilter.gte) {
            query.gte(key, columnFilter.gte)
        } else if (columnFilter.lt) {
            query.lt(key, columnFilter.lt)
        } else if (columnFilter.lte) {
            query.lte(key, columnFilter.lte)
        } else if (columnFilter.like) {
            query.like(key, columnFilter.like)
        } else if (columnFilter.ilike) {
            query.ilike(key, columnFilter.ilike)
        } else if (columnFilter.is) {
            query.is(key, columnFilter.is)
        } else if (columnFilter.in) {
            query.in(key, columnFilter.in)
        } else if (columnFilter.contains) {
            query.contains(key, columnFilter.contains)
        } else if (columnFilter.containedBy) {
            query.containedBy(key, columnFilter.containedBy)
        } else if (columnFilter.rangeGt) {
            query.rangeGt(key, columnFilter.rangeGt)
        } else if (columnFilter.rangeGte) {
            query.rangeGte(key, columnFilter.rangeGte)
        } else if (columnFilter.rangeLt) {
            query.rangeLt(key, columnFilter.rangeLt)
        } else if (columnFilter.rangeLte) {
            query.rangeLte(key, columnFilter.rangeLte)
        } else if (columnFilter.rangeAdjacent) {
            query.rangeAdjacent(key, columnFilter.rangeAdjacent)
        } else if (columnFilter.overlaps) {
            query.overlaps(key, columnFilter.overlaps as any)
        } else if (columnFilter.textSearch) {
            query.textSearch(key, columnFilter.textSearch.query, {
                type: columnFilter.textSearch.type,
                config: columnFilter.textSearch.config
            })
        } else if (columnFilter.not) {
            query.not(key, columnFilter.not.operator, columnFilter.not.value)
        } else if (columnFilter.filter) {
            query.filter(key, columnFilter.filter.operator, columnFilter.filter.value)
        }
    }

    if (filters.or) {
        query.or(filters.or)
    }

    if (filters.match) {
        query.match(filters.match)
    }

    query.limit(filters.limit != undefined ? filters.limit : 100)

    if (filters.range) {
        query.range(filters.range[0], filters.range[1])
    } else if (filters.offset) {
        query.range(filters.offset, filters.limit || 100)
    }

    if (Array.isArray(filters.order)) {
        for (const order of filters.order) {
            query.order(order.column as string, {
                ascending: order.options?.ascending,
                nullsFirst: order.options?.nullsFirst,
                referencedTable: order.options?.referencedTable
            })
        }
    } else if (filters.order) {
        query.order(filters.order.column as string, {
            ascending: filters.order.options?.ascending,
            nullsFirst: filters.order.options?.nullsFirst,
            referencedTable: filters.order.options?.referencedTable
        })
    }
}


// FILTERS

type ColumnFilters<T> = {
    eq?: T,
    neq?: T,
    gt?: T,
    gte?: T,
    lt?: T,
    lte?: T,
    like?: string,
    ilike?: string,
    is?: unknown,
    in?: Partial<T>[],
    contains?: Partial<T> | string,
    containedBy?: Partial<T> | string,
    rangeGt?: string,
    rangeGte?: string,
    rangeLt?: string,
    rangeLte?: string,
    rangeAdjacent?: string,
    overlaps?: Partial<T> | string,
    textSearch?: { query: string, config?: string; type?: "plain" | "phrase" | "websearch" },
    not?: { operator: string, value: unknown }
    filter?: { operator: string, value: unknown }
}

type Order<T> = {
    column: keyof T,
    options?: {
        ascending?: boolean
        nullsFirst?: boolean
        referencedTable?: undefined
    } | null
}

export type QueryFilters<T> = {
    [key in keyof T]?: ColumnFilters<T[key]> | T[key]
} & {
    or?: string
    match?: Partial<T>
    order?: Order<T>[] | Order<T> | null
    limit?: number
    range?: [number, number]
    offset?: number
    explain?: boolean
    apply?: (query: SupabaseQuery) => void
} & {
    [key: string]: ColumnFilters<unknown> | unknown
}