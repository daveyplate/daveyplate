import { useState } from "react"

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'
import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from "@/i18n/translation-props"
import { dynamicHref, isExport } from "@/utils/utils"

import { Card, CardBody, Input, Skeleton, cn } from "@nextui-org/react"

import UserAvatar from "@/components/user-avatar"

import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/solid"
import { useEntities } from "@daveyplate/supabase-swr-entities/client"
import { useDebounce } from "@uidotdev/usehooks"
import { Link } from "@/i18n/routing"

// <div className="fixed top-0 w-screen h-safe bg-background z-40" />
// <div className="sticky top-safe z-40 backdrop-blur-xl bg-background/70 shadow-lg sm:shadow-none w-full">

export default function UsersPage() {
    const { autoTranslate } = useAutoTranslate()
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 300);

    const { entities, isLoading } = useEntities('profiles', debouncedSearch ? { full_name_ilike: debouncedSearch } : null, { keepPreviousData: true })
    const users = entities?.filter(user => user.full_name?.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="flex-container mx-auto max-w-xl">
            <Input
                size="lg"
                fullWidth
                isClearable
                placeholder={autoTranslate('search_placeholder', "Type to search...")}
                startContent={
                    <SearchIcon className="size-5 me-0.5 pointer-events-none" />
                }
                value={search}
                onValueChange={setSearch}
            />

            <div className="flex flex-col gap-4 transition-all w-full">
                {!users?.length && !isLoading && (
                    <Card fullWidth>
                        <CardBody className="p-8">
                            <AutoTranslate tKey="no_users">
                                No users found...
                            </AutoTranslate>
                        </CardBody>
                    </Card>
                )}

                {isLoading && !users && [...Array(3)].fill({}).map((_, index) => (
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

                {users?.map((user, index) => (
                    <Card
                        key={index}
                        as={Link}
                        href={dynamicHref({ pathname: "/user/[user_id]", query: { user_id: user.id } })}
                        isPressable
                        fullWidth
                    >
                        <CardBody className="p-4 flex-row items-center gap-4">
                            <UserAvatar user={user} size="lg" />

                            <div>
                                <p className="font-semibold">
                                    {user.full_name || "Unnamed"}
                                </p>

                                <p className="text-foreground-400 text-small">
                                    <AutoTranslate tKey="subscription">
                                        Subscription:
                                    </AutoTranslate>

                                    <span className={cn('ml-1.5', user.claims?.premium ? "text-success font-semibold" : "text-foreground font-light")}>
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
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export async function getStaticProps({ locale, params }) {
    const translationProps = await getTranslationProps({ locale, params })


    return { props: { ...translationProps, } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined