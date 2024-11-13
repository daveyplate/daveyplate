import { useRouter } from 'next/router'
import { useEntity } from '@daveyplate/supabase-swr-entities/client'
import { Card, CardBody, Divider, Skeleton } from "@nextui-org/react"
import UserAvatar from "@/components/user-avatar"
import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'
import { Spinner } from '@nextui-org/react'

export default function ArticlePage() {
    const { autoTranslate } = useAutoTranslate()
    const router = useRouter()
    const { article_id } = router.query
    const { entity: article, isLoading } = useEntity(article_id ? 'articles' : null, article_id)

    if (isLoading) return <Spinner />

    return (
        <div className="flex-container max-w-3xl mx-auto p-4">
            <Skeleton isLoaded={!!article} className="mb-4">
                <Card>
                    <CardBody className="p-8">
                        <div className="flex gap-4 items-center mb-4">
                            <UserAvatar user={{ avatar_url: article?.user.avatar_url }} size="lg" />
                            <h1 className="text-4xl font-bold">
                                {article?.title && article?.title.en}
                            </h1>
                        </div>
                        <Divider />
                        <div className="mt-6 mb-4">
                            <AutoTranslate>
                                <p>{article?.content && article?.content.en}</p>
                            </AutoTranslate>
                        </div>
                    </CardBody>
                </Card>
            </Skeleton>
        </div>
    )
}