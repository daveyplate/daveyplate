import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { PostgrestFilterBuilder } from "@supabase/postgrest-js"
import { createQueries } from "entities.generated"
import { useCallback, useEffect, useMemo } from "react"
import useSWR, { SWRConfiguration, useSWRConfig } from "swr"
import useSWRInfinite, { SWRInfiniteConfiguration } from "swr/infinite"

export type SupabaseQuery = PostgrestFilterBuilder<any, any, any> & {
    url: URL
}

export interface Entity {
    id: string
    [key: string]: any
}

const amendEntity = (entities: Entity[], entity: Entity) => {
    const index = entities.findIndex((e) => e.id == entity.id)

    if (index >= 0) {
        const newEntities = [...entities]
        newEntities[index] = entity
        return newEntities
    }

    return entities
}

const appendEntity = (entities: Entity[], entity: Entity) => {
    if (entities.find((d) => d.id == entity.id)) return amendEntity(entities, entity)
    return [...entities, entity]
}

export function useEntities<T extends Entity>(
    table?: string | null,
    filters?: QueryFilters<T> | null,
    config?: SWRConfiguration | null
) {
    const supabase = useSupabaseClient()
    // TODO pass <Database> to the provider? and inherit type here somehow?
    const query = table ? (createQueries() as any)[table] : null
    const select = query?.url.searchParams.get("select") as string || "*"

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
                const existingEntity = currentData.find((d) => d.id == id)

                const newData = amendEntity(currentData, { id, ...existingEntity, ...values })
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


export function useSupabaseInfiniteSWR<T extends Entity>(
    table?: string | null,
    filters?: QueryFilters<T> | null,
    config?: SWRInfiniteConfiguration | null
) {
    const { cache } = useSWRConfig()

    const createQuery = (pageIndex: number) => {
        const query: SupabaseQuery = (createQueries() as any)[table!]!
        if (!query) throw new Error(`Query not found for table: "${table}" in entities.generated.ts`)

        const newFilters = filters?.id ? filters : {
            ...filters,
            limit: filters?.limit || 100,
            offset: pageIndex * (filters?.limit || 100),
        } as QueryFilters<T>
        applyFilters<T>(query, newFilters)

        return query
    }

    const getKey = (pageIndex: number, previousPageData: Entity[]) => {
        if (previousPageData && !previousPageData.length) return null
        if (!table) return null

        const query = createQuery(pageIndex)
        const queryPath = query.url.toString().split("/rest/v1/")[1]

        return [`entities:${queryPath}`, pageIndex]
    }

    const swr = useSWRInfinite<T[]>(
        getKey,
        async ([, pageIndex]) => await createQuery(pageIndex)!.throwOnError().then(({ data }) => data),
        config || undefined
    )

    const { data } = swr
    const entities = useMemo<T[]>(() => data?.reduce((acc, page) => [...acc, ...page], []) || [], [data])

    useEffect(() => {
        if (!data) return

        // populate cache
        for (const key of cache.keys()) {
            if (!key.includes("entities:")) continue
            // console.log(key, cache.get(key))
        }
    }, [data])

    return { ...swr, data: entities }
}


export function useSupabaseSWR<T extends Entity>(
    table?: string | null,
    query?: SupabaseQuery | null,
    filters?: QueryFilters<T> | null,
    config?: SWRConfiguration | null
) {
    const { cache, mutate } = useSWRConfig()

    if (query && filters) applyFilters<T>(query, filters)

    const queryPath = query?.url.toString().split("/rest/v1/")[1]
    const swrKey = queryPath ? `entities:${queryPath}` : null

    const swr = useSWR<T[]>(
        swrKey,
        async () => await query!.throwOnError().then(({ data }) => data),
        config || undefined
    )

    const { data } = swr

    useEffect(() => {
        if (!data) return

        // populate cache
        for (const key of cache.keys()) {
            if (key == swrKey) continue
            if (!key.startsWith('$inf$@"entities:')) continue
            if (key.replace('$inf$@"entities:', '').split('?')[0] != table) continue

            const { data: cacheData } = cache.get(key)! as { data: Entity[][] }
            if (!cacheData) continue

            // compare cacheData and data for any changes to individual entities
            let newData = [...cacheData]

            for (let i = 0; i < newData.length; i++) {
                const page = newData[i]
                let newPage = [...page]

                for (const entity of page) {
                    const currentEntity = data.find((d) => d.id === entity.id)

                    if (currentEntity && JSON.stringify(currentEntity) != JSON.stringify(entity)) {
                        newPage = amendEntity(page, currentEntity)
                    }
                }

                newData[i] = newPage
            }

            if (JSON.stringify(newData) != JSON.stringify(cacheData)) {
                console.log(key, "mutate it!")
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
        if (["limit", "offset", "order", "or", "match", "range", "explain", "apply"].includes(key)) continue

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

    if (filters.apply) {
        filters.apply(query)
    }

    if (filters.limit) {
        query.limit(filters.limit)
    }

    if (filters.range) {
        query.range(filters.range[0], filters.range[1])
    } else if (filters.offset) {
        query.range(filters.offset, filters.offset + (filters.limit || 100) - 1)
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

    if (filters.explain) {
        query.explain()
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