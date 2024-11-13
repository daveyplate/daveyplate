import { useEntities } from '@daveyplate/supabase-swr-entities/client'
import { Card, CardBody, Image } from "@nextui-org/react"
import UserAvatar from "@/components/user-avatar"
import { Link } from "@/i18n/routing"
import { useState } from 'react'
import { getLocaleValue } from '@daveyplate/supabase-swr-entities/client'
import { useLocale } from 'next-intl'
import { getTranslationProps } from "@/i18n/translation-props"

export default function BlogPage() {
    const locale = useLocale()
    const [search, setSearch] = useState('')
    const { entities: articles, isLoading } = useEntities('articles', { lang: locale })

    return (
        <div className="flex-container max-w-4xl mx-auto p-4">
            <div className="grid grid-cols-1 gap-8">
                {articles?.map((article) => (
                    <Card key={article.id} as={Link} href={`/article/${article.id}`} isPressable>
                        <CardBody className="flex flex-col items-start p-4">
                            {article.thumbnail_url && (
                                <Image
                                    src={article.thumbnail_url}
                                    alt="Article thumbnail"
                                    className="mb-2"
                                    objectFit="cover"
                                    width="100%"
                                    height="150px"
                                />
                            )}
                            <p className="flex items-center mb-2 text-lg font-bold">
                                {getLocaleValue(article.title, locale)}
                            </p>
                            <p className="text-sm opacity-80 mb-4">
                                {getLocaleValue(article.summary, locale)}
                            </p>
                            <div className="flex items-center">
                                <span className="text-base text-gray-600 font-medium mr-2">
                                    {`By ${article.user.full_name}`}
                                </span>
                                <UserAvatar user={article.user} size="sm" />
                            </div>
                        </CardBody>
                    </Card>
                ))}
                {isLoading && <p>Loading...</p>}
            </div>
        </div>
    )
}

export async function getStaticProps({ locale, params }) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}