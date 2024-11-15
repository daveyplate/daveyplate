import React from 'react'
import { Card, CardBody } from "@nextui-org/react"
import { getLocaleValue } from '@daveyplate/supabase-swr-entities/client'
import { useLocale } from 'next-intl'
import UserAvatar from '@/components/user-avatar'

const ArticleComment = ({ comment }) => {
    const locale = useLocale()
    const localizedContent = getLocaleValue(comment.content, locale)

    return (
        <Card fullWidth>
            <CardBody className="p-4 gap-4">
                <div className="flex items-center gap-4">
                    <UserAvatar user={comment.user} size="sm" />

                    <div>
                        <h6>
                            {comment.user.full_name}
                        </h6>

                        <p className="text-tiny text-foreground/60">
                            {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <p>
                    {localizedContent}
                </p>
            </CardBody>
        </Card>
    )
}

export default ArticleComment