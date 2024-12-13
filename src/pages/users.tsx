import { useDebounce } from "@uidotdev/usehooks"
import { useState } from "react"
import { GetStaticProps } from "next"

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'

import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/solid"
import { Card, CardBody, Input, Skeleton, cn } from "@nextui-org/react"

import UserAvatar from "@/components/user-avatar"
import { getLocalePaths } from "@/i18n/locale-paths"
import { Link } from "@/i18n/routing"
import { getTranslationProps } from "@/i18n/translation-props"
import { isExport } from "@/utils/utils"
import { useProfiles } from "entities.generated"

export default function UsersPage() {
    const { autoTranslate } = useAutoTranslate()
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 300)

    const { data, isLoading } = useProfiles(true, debouncedSearch ? { full_name_ilike: debouncedSearch } : null, { keepPreviousData: true })
    const users = data?.filter(user => user.full_name?.toLowerCase().includes(search.toLowerCase()))

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
                            <div className="flex items-center gap-2">
                                <UserAvatar user={user} />

                                <div className="flex flex-col">
                                    <p className="text-small text-foreground">
                                        {user.full_name || "Unnamed"}
                                    </p>

                                    <p className="text-tiny text-foreground-400">
                                        <AutoTranslate tKey="subscription">
                                            Subscription:
                                        </AutoTranslate>

                                        &nbsp;

                                        <span className={cn(false ? "text-success" : "text-foreground")}>
                                            {false ?
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
                ))}
            </div>
        </div>
    )
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps, } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined