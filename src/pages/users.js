import { useDebounce } from "@uidotdev/usehooks"
import { useLocale } from "next-intl"
import { useState } from "react"

import { useEntities } from "@daveyplate/supabase-swr-entities/client"
import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'

import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/solid"
import { Card, CardBody, Input, Skeleton, User, cn } from "@nextui-org/react"

import { getLocalePaths } from "@/i18n/locale-paths"
import { Link } from "@/i18n/routing"
import { getTranslationProps } from "@/i18n/translation-props"
import { isExport } from "@/utils/utils"


export default function UsersPage() {
    const locale = useLocale()
    const { autoTranslate } = useAutoTranslate()
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 300)

    const { entities, isLoading } = useEntities('profiles', debouncedSearch ? { full_name_ilike: debouncedSearch, lang: locale } : { lang: locale }, { keepPreviousData: true })
    const users = entities?.filter(user => user.full_name?.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="p-4">
            <div className="flex flex-col gap-4 items-center">
                <Input
                    fullWidth
                    className="pt-safe max-w-xl"
                    isClearable
                    placeholder={autoTranslate('search_placeholder', "Search...")}
                    startContent={
                        <SearchIcon className="size-5 pointer-events-none" />
                    }
                    value={search}
                    onValueChange={setSearch}
                />

                {!users?.length && !isLoading && (
                    <Card fullWidth className="max-w-xl">
                        <CardBody className="p-8">
                            <AutoTranslate tKey="no_users">
                                No users found...
                            </AutoTranslate>
                        </CardBody>
                    </Card>
                )}

                {isLoading && !users && [...Array(8)].fill({}).map((_, index) => (
                    <Card key={index} fullWidth className="max-w-xl">
                        <CardBody className="p-4">
                            <div className="flex items-center gap-2">
                                <Skeleton className="size-10 rounded-full" />

                                <div className="space-y-1">
                                    <Skeleton className="h-3.5 w-[100px] rounded-full" />
                                    <Skeleton className="h-3.5 w-[150px] rounded-full" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}

                {users?.map((user, index) => (
                    <Card
                        key={index}
                        fullWidth
                        className="max-w-xl"
                        as={Link}
                        href={`/user?user_id=${user.id}`}
                        linkAs={`/user/${user.id}`}
                        isPressable
                    >
                        <CardBody className="p-4 items-start">
                            <User
                                avatarProps={{
                                    src: user?.avatar_url
                                }}
                                description={
                                    <>
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
                                    </>
                                }
                                name={user.full_name || "Unnamed"}
                            />
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