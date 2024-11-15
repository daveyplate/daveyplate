import { useEntities, useEntity } from '@daveyplate/supabase-swr-entities/client'
import { Button, Card, CardBody, Image, Skeleton, Textarea } from "@nextui-org/react"
import UserAvatar from "@/components/user-avatar"
import { AutoTranslate } from 'next-auto-translate'
import { useLocale } from 'next-intl'
import { getLocaleValue } from '@daveyplate/supabase-swr-entities/client'

import { getTranslationProps } from "@/i18n/translation-props"
import { getLocalePaths } from "@/i18n/locale-paths"
import { isExport } from "@/utils/utils"
import { getEntity } from '@daveyplate/supabase-swr-entities/server'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { PageTitle } from "@daveyplate/next-page-title"
import { OpenGraph } from "@daveyplate/next-open-graph"
import ArticleComment from '@/components/blog/article-comment'
import { useSession } from '@supabase/auth-helpers-react'
import { v4 } from 'uuid'

export default function ArticlePage({ article_id, article: fallbackData }) {
    const locale = useLocale()
    const router = useRouter()
    const session = useSession()
    const { entity: user } = useEntity(session && 'profiles', 'me')
    const articleId = article_id || router.query.article_id
    const { entity: article } = useEntity(articleId && 'articles', article_id, { lang: locale }, { fallbackData })
    const {
        entities: comments,
        createEntity: createComment,
        updateEntity: updateComment,
        deleteEntity: deleteComment,
        mutateEntities: mutateComments,
    } = useEntities(articleId && 'article_comments', { article_id: articleId, lang: locale })

    const [commentContent, setCommentContent] = useState('')

    const handleCommentSubmit = async () => {
        if (!commentContent || !user) return

        const newComment = {
            id: v4(), article_id: articleId, content: { [locale]: commentContent }
        }

        createComment(newComment)
        mutateComments([{ ...newComment, user, created_at: new Date() }, ...comments], false)
        setCommentContent('')
    }

    const localizedTitle = getLocaleValue(article?.title, locale)
    const localizedSummary = getLocaleValue(article?.summary, locale)
    const localizedContent = getLocaleValue(article?.content, locale)

    return (
        <div className="flex-container max-w-xl mx-auto">
            <PageTitle title={localizedTitle} />

            <OpenGraph
                title={localizedTitle}
                description={localizedSummary || localizedContent?.substring(0, 200)}
                image={article?.thumbnail_url}
                ogType="article"
            />

            {!article ? (
                <Card fullWidth>
                    <CardBody className="flex flex-col items-start p-4 gap-4">
                        <Skeleton className="text-lg h-8 w-1/2 rounded-lg" />
                        <Skeleton className="h-20 w-full rounded-lg" />
                        <Skeleton className="text-sm h-7 w-1/3 rounded-lg" />
                    </CardBody>
                </Card>
            ) : (
                <>
                    <Card fullWidth>
                        <CardBody className="flex flex-col items-start p-4 gap-4">
                            <h5 className="flex items-center">
                                {article?.thumbnail_url && (
                                    <Image
                                        src={article.thumbnail_url}
                                        alt={localizedTitle}
                                        className="w-12 h-12 mr-4"
                                        objectFit="cover"
                                    />
                                )}
                                {localizedTitle}
                            </h5>

                            {article?.thumbnail_url && (
                                <Image
                                    src={article.thumbnail_url}
                                    alt={localizedTitle}
                                    className="w-full"
                                />
                            )}

                            <p>
                                {localizedContent}
                            </p>

                            <div className="flex items-center">
                                <span className="text-gray-600 font-medium mr-2">
                                    <AutoTranslate tKey="written_by">Written By</AutoTranslate> {article?.user?.full_name}
                                </span>

                                <UserAvatar user={article?.user} size="sm" />
                            </div>
                        </CardBody>
                    </Card>

                    <h5>
                        <AutoTranslate tKey="comments">
                            Comments
                        </AutoTranslate>
                    </h5>

                    {session && (
                        <Card fullWidth>
                            <CardBody className="flex flex-col gap-4 p-4 items-start">
                                <Textarea
                                    size="lg"
                                    variant="bordered"
                                    placeholder="Add your comment..."
                                    value={commentContent}
                                    onValueChange={setCommentContent}
                                />

                                <Button
                                    color="primary"
                                    onPress={handleCommentSubmit}
                                    size="lg"
                                >
                                    <AutoTranslate tKey="submit">
                                        Submit
                                    </AutoTranslate>
                                </Button>
                            </CardBody>
                        </Card>
                    )}

                    {comments && comments.map(comment => (
                        <ArticleComment
                            key={comment.id}
                            comment={comment}
                            updateComment={updateComment}
                            deleteComment={deleteComment}
                        />
                    ))}
                </>
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