import React, { memo, useState } from 'react'
import { Card, CardBody, Button, Textarea } from "@nextui-org/react"
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid'
import { getLocaleValue } from '@daveyplate/supabase-swr-entities/client'
import { useLocale } from 'next-intl'
import UserAvatar from '@/components/user-avatar'
import { toast } from '@/components/providers/toast-provider'
import { useSession } from '@supabase/auth-helpers-react'

const ArticleComment = memo(({ comment, updateComment, deleteComment }) => {
    const locale = useLocale()
    const session = useSession()
    const [isEditing, setIsEditing] = useState(false)
    const [editedContent, setEditedContent] = useState(getLocaleValue(comment.content, locale))

    const handleEdit = async () => {
        setIsEditing(false)

        console.log("try to update")
        const result = await updateComment(comment.id, { content: { [locale]: editedContent } })

        console.log("update result", result)
        // error && toast(error.message, { color: 'danger' })
    }

    const handleDelete = async () => {
        const result = await deleteComment(comment.id)
        console.log("delete result", result)
        // error && toast(error.message, { color: 'danger' })
    }

    return (
        <Card fullWidth>
            <CardBody className="px-4 gap-4">
                <div className="flex items-center gap-4">
                    <UserAvatar user={comment.user} size="sm" />

                    <div>
                        <h6>
                            {comment.user?.full_name}
                        </h6>

                        <p className="text-default-500 text-small">
                            {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    {!isEditing && session && comment.user?.id == session?.user.id && (
                        <Button
                            isIconOnly
                            radius="full"
                            onPress={() => setIsEditing(true)}
                            className="ms-auto -mt-2 -me-2"
                            variant="light"
                        >
                            <PencilIcon className="size-4" />
                        </Button>
                    )}
                </div>

                {isEditing ? (
                    <Textarea
                        value={editedContent}
                        onValueChange={setEditedContent}
                        fullWidth
                        size="lg"
                        variant="bordered"
                    />
                ) : (
                    <p>
                        {getLocaleValue(comment.content, locale)}
                    </p>
                )}

                {isEditing && (
                    <div className="flex gap-2">
                        <Button
                            size="lg"
                            color="primary"
                            onPress={handleEdit}
                        >
                            Save
                        </Button>

                        <Button
                            size="lg"
                            onPress={() => setIsEditing(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            isIconOnly
                            size="lg"
                            color="danger"
                            onPress={handleDelete}
                        >
                            <TrashIcon className="size-4" />
                        </Button>
                    </div>
                )}
            </CardBody>
        </Card>
    )
})

export default ArticleComment