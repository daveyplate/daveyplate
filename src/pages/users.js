import { useCallback, useEffect, useState } from "react"
import { useSWRConfig } from "swr"
import debounce from 'lodash.debounce'

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'

import { createClient } from "@/utils/supabase/service-role"

import { getStaticPaths as getExportStaticPaths } from "@/lib/get-static"
import { getTranslationProps } from "@/lib/translation-props"
import { isExport } from "@/utils/utils"
import { useCache } from "@/components/cache-provider"

import { Card, CardBody, Input, Skeleton, cn } from "@nextui-org/react"

import Link from '@/components/locale-link'
import UserAvatar from "@/components/user-avatar"

import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/solid"

export default function UsersPage({ users }) {
    const { autoTranslate } = useAutoTranslate()
    const { mutate, enabled } = useSWRConfig()

    const [skeletonCount, setSkeletonCount] = useState(4)
    const [search, setSearch] = useState('')
    const [q, setQ] = useState('')

    const isLoading = false

    // Debounce the search function
    const debouncedSearch = useCallback(debounce((query) => setQ(query), 300), [])

    useEffect(() => {
        debouncedSearch(search)
    }, [search])

    useEffect(() => {
        if (!enabled) return

        if (users?.length > 0) {
            setSkeletonCount(Math.min(4, Math.max(users.length, 1)))
        }

        users?.map(user => {
            mutate(`/api/users/${user.id}`, user)
        })
    }, [users, enabled])

    return (
        <div className="flex-container max-w-xl transition-all flex flex-col !px-0 !pt-0">
            <h2 className="text-center hidden sm:block">
                <AutoTranslate tKey="title">
                    Users
                </AutoTranslate>
            </h2>

            <div className="fixed top-0 w-screen h-safe bg-background z-40" />

            <div className="sticky top-safe z-40 backdrop-blur-xl bg-background/70 p-4 shadow-lg sm:shadow-none">
                <Input
                    isClearable
                    classNames={{
                        input: "!text-base",
                        inputWrapper: "px-4"
                    }}
                    placeholder={autoTranslate('search_placeholder', "Type to search...")}
                    startContent={
                        <SearchIcon className="size-6 me-1 pointer-events-none cursor-pointer" />
                    }
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onClear={() => setSearch('')}
                />
            </div>

            <div className="flex flex-col gap-4 px-4 transition-all">
                {(!users || users.length == 0) && !isLoading && (
                    <Card>
                        <CardBody className="p-8">
                            <AutoTranslate tKey="no_users">
                                No users found...
                            </AutoTranslate>
                        </CardBody>
                    </Card>
                )}

                {isLoading && !users && [...Array(skeletonCount)].fill({}).map((_, index) => (
                    <Card key={index}>
                        <CardBody className="p-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="size-14 rounded-full" />

                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[100px] rounded-lg" />
                                    <Skeleton className="h-4 w-[150px] rounded-lg" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}

                {(!isLoading || search.length == 0) && users?.map((user, index) => (
                    <Link
                        key={index}
                        href={{ pathname: "/user/[user_id]", query: { user_id: user.id, push: true } }}
                        legacyBehavior
                    >
                        <Card isPressable className="w-full">
                            <CardBody className="p-4">
                                <div className="flex items-center gap-4">
                                    <UserAvatar user={user} size="lg" className="text-base" />

                                    <div>
                                        <p className="font-semibold">
                                            {user.full_name || "Unnamed"}
                                        </p>

                                        <p className="text-foreground-400 text-sm">
                                            <AutoTranslate tKey="subscription">
                                                Subscription:
                                            </AutoTranslate>

                                            <span className={cn('ml-1', user.claims?.premium ? "text-success font-semibold" : "text-foreground font-light")}>
                                                {user.claims?.premium ?
                                                    <AutoTranslate tKey="active">
                                                        Active
                                                    </AutoTranslate>
                                                    :
                                                    <AutoTranslate tKey="inactive">
                                                        Inactive
                                                    </AutoTranslate>
                                                }
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export async function getStaticProps({ locale, ...context }) {
    const translationProps = await getTranslationProps({ locale, ...context })

    if (isExport()) return { props: { ...translationProps } }

    console.log(process.env)

    const supabase = createClient()
    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('deactivated', false)
        .order('created_at', { ascending: false })

    if (error) return { notFound: true }

    return {
        props: {
            ...translationProps,
            users,
        },
        revalidate: 60
    }
}

export const getStaticPaths = isExport() ? getExportStaticPaths : undefined