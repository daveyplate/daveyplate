import { useEntity } from '@daveyplate/supabase-swr-entities/client'
import { Card, CardBody, Divider, Skeleton, Image } from "@nextui-org/react"
import UserAvatar from "@/components/user-avatar"
import { AutoTranslate } from 'next-auto-translate'
import { useLocale } from 'next-intl'
import { getLocaleValue } from '@daveyplate/supabase-swr-entities/client'

import { getTranslationProps } from "@/i18n/translation-props"
import { getLocalePaths } from "@/i18n/locale-paths"
import { isExport } from "@/utils/utils"
import { createClient } from "@/utils/supabase/component"
import { getEntity } from '@daveyplate/supabase-swr-entities/server'

export default function ArticlePage({ article_id }) {
    const locale = useLocale()
    const { entity: article, isLoading } = useEntity('articles', article_id)

    return (
        <div className="max-w-xl mx-auto container flex flex-col items-start gap-4 p-4">
            <Skeleton isLoaded={!isLoading} className="w-full">
                <Card className="w-full">
                    <CardBody className="p-4 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <UserAvatar user={article?.user} size="lg" />
                            <div className="flex flex-col gap-1">
                                <h2 className="text-xl font-semibold">
                                    {getLocaleValue(article?.title, locale)}
                                </h2>

                                <p className="text-sm opacity-80">
                                    <AutoTranslate tKey="written_by">Written By</AutoTranslate> {article?.user?.full_name}
                                </p>
                            </div>
                        </div>

                        {article?.thumbnail_url && (
                            <Image src={article.thumbnail_url} alt={getLocaleValue(article.title, locale)} />
                        )}

                        <Divider />

                        <div>
                            {getLocaleValue(article?.content, locale)}
                        </div>
                    </CardBody>
                </Card>
            </Skeleton>
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
