import { useState } from "react"
import { useDebounce } from "@uidotdev/usehooks"

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'
import { useEntities } from "@daveyplate/supabase-swr-entities/client"

import { Card, CardBody, Input, Skeleton, cn } from "@nextui-org/react"
import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/solid"

import { Link } from "@/i18n/routing"
import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from "@/i18n/translation-props"
import { isExport } from "@/utils/utils"

import UserAvatar from "@/components/user-avatar"
import { useLocale } from "next-intl"

export default function UsersPage() {
    const locale = useLocale()
    const { autoTranslate } = useAutoTranslate()
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 300)

    const { entities, isLoading } = useEntities('profiles', debouncedSearch ? { full_name_ilike: debouncedSearch, lang: locale } : { lang: locale }, { keepPreviousData: true })
    const users = entities?.filter(user => user.full_name?.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="p-4">
            <div className="flex flex-col gap-4 max-w-xl mx-auto">
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
                    <Card key={index} fullWidth>
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
                        href={`/user?user_id=${user.id}`}
                        linkAs={`/user/${user.id}`}
                        isPressable
                        fullWidth
                    >
                        <CardBody className="p-4 flex-row items-center gap-4">
                            <UserAvatar user={user} size="lg" className="text-base" />

                            <div className="flex flex-col items-start justify-center">
                                <p className="font-medium">
                                    {user.full_name || "Unnamed"}
                                </p>

                                <span className="text-small text-default-500">
                                    <AutoTranslate tKey="subscription">
                                        Subscription:
                                    </AutoTranslate>

                                    &nbsp;

                                    <span className={cn(user.claims?.premium ? "text-success" : "text-foreground")}>
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
                                </span>
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