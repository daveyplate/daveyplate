import UserAvatar from "@/components/user-avatar"
import { getLocalePaths } from '@/i18n/locale-paths'
import { Link } from "@/i18n/routing"
import { getTranslationProps } from "@/i18n/translation-props"
import { getLocaleValue, isExport, useEntities } from '@daveyplate/supabase-swr-entities/client'
import { Card, CardBody, Image, Skeleton } from "@nextui-org/react"
import { Article } from "entity.types"
import { GetStaticPropsContext } from "next"
import { AutoTranslate } from 'next-auto-translate'
import { useLocale } from 'next-intl'

export default function BlogPage() {
    const locale = useLocale()
    const { entities: articles, isLoading } = useEntities<Article>('articles', { lang: locale })

    return (
        <div className="flex-container max-w-xl mx-auto">
            {isLoading && [...Array(3)].fill({}).map((_, index) => (
                <Card key={index} fullWidth>
                    <CardBody className="flex flex-col items-start p-4 gap-4">
                        <Skeleton className="text-lg h-8 w-1/2 rounded-lg" />
                        <Skeleton className="text-sm h-5 w-3/4 rounded-lg" />
                        <Skeleton className="text-sm h-7 w-1/3 rounded-lg" />
                    </CardBody>
                </Card>
            ))}

            {!isLoading && articles?.map((article) => (
                <Card
                    key={article.id}
                    as={Link}
                    href={`/article?article_id=${article.id}`}
                    linkAs={`/article/${article.id}`}
                    isPressable
                    fullWidth
                >
                    <CardBody className="flex flex-col items-start p-4 gap-4">
                        <h5 className="flex items-center">
                            {article.thumbnail_url && (
                                <Image
                                    src={article.thumbnail_url}
                                    alt={getLocaleValue(article.title, locale)}
                                    className="w-12 h-12"
                                />
                            )}

                            {getLocaleValue(article.title, locale)}
                        </h5>

                        <p className="text-sm opacity-80">
                            {getLocaleValue(article.summary, locale)}
                        </p>

                        <div className="flex items-center">
                            <span className="text-gray-600 font-medium mr-2">
                                <AutoTranslate tKey="written_by">Written By</AutoTranslate> {article?.user?.full_name}
                            </span>

                            <UserAvatar user={article?.user} size="sm" />
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    )
}

export async function getStaticProps({ locale, params }: GetStaticPropsContext) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined