import { useEntity } from '@daveyplate/supabase-swr-entities/client'
import { Card, CardBody, Image, Skeleton } from "@nextui-org/react"
import UserAvatar from "@/components/user-avatar"
import { AutoTranslate } from 'next-auto-translate'
import { useLocale } from 'next-intl'
import { getLocaleValue } from '@daveyplate/supabase-swr-entities/client'

import { getTranslationProps } from "@/i18n/translation-props"
import { getLocalePaths } from "@/i18n/locale-paths"
import { isExport } from "@/utils/utils"
import { getEntity } from '@daveyplate/supabase-swr-entities/server'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ArticlePage({ article_id }) {
    const locale = useLocale()
    const router = useRouter()
    const articleId = article_id || router.query.article_id
    const { entity: article } = useEntity(articleId && 'articles', article_id, { lang: locale })

    return (
        <div className="flex-container max-w-xl mx-auto">
            {!article ? (
                <Card fullWidth>
                    <CardBody className="flex flex-col items-start p-4 gap-4">
                        <Skeleton className="text-lg h-8 w-1/2 rounded-lg" />
                        <Skeleton className="h-20 w-full rounded-lg" />
                        <Skeleton className="text-sm h-7 w-1/3 rounded-lg" />
                    </CardBody>
                </Card>
            ) : (
                <Card fullWidth>
                    <CardBody className="flex flex-col items-start p-4 gap-4">
                        <h5 className="flex items-center">
                            {article?.thumbnail_url && (
                                <Image
                                    src={article.thumbnail_url}
                                    alt={getLocaleValue(article.title, locale)}
                                    className="w-12 h-12 mr-4"
                                    objectFit="cover"
                                />
                            )}
                            {getLocaleValue(article?.title, locale)}
                        </h5>

                        {article?.thumbnail_url && (
                            <Image
                                src={article.thumbnail_url}
                                alt={getLocaleValue(article.title, locale)}
                                className="w-full"
                            />
                        )}

                        <p>
                            {getLocaleValue(article?.content, locale)}
                        </p>

                        <div className="flex items-center">
                            <span className="text-gray-600 font-medium mr-2">
                                <AutoTranslate tKey="written_by">Written By</AutoTranslate> {article?.user?.full_name}
                            </span>

                            <UserAvatar user={article?.user} size="sm" />
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    )
}

export async function getStaticPaths() {
    if (isExport()) return getLocalePaths()

    return {
        paths: [],
        fallback: true
    }
}

export async function getStaticProps({ locale, params }) {
    const translationProps = await getTranslationProps({ locale, params })

    if (isExport()) return { props: { ...translationProps, canGoBack: true } }

    const { article_id } = params
    const { entity: article } = await getEntity('articles', article_id, { lang: locale })

    return {
        props: {
            ...translationProps,
            article_id,
            article,
            canGoBack: true
        },
        revalidate: 60
    }
}