import { useRef, useState } from "react"
import { useRouter } from "next/router"

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'
import { useEntity } from "@daveyplate/supabase-swr-entities/client"

import { getTranslationProps } from "@/i18n/translation-props"
import { getLocalePaths } from "@/i18n/locale-paths"

import {
    Badge,
    Button,
    Card,
    CardBody,
    cn,
    Divider,
    Skeleton
} from "@nextui-org/react"

import UserAvatar from "@/components/user-avatar"
import PageTitle from "@/components/page-title"
import { isExport } from "@/utils/utils"
import { DragDropzone } from "@daveyplate/tailwind-drag-dropzone"
import { toast } from "@/components/providers/toast-provider"
import { PencilIcon } from "@heroicons/react/24/solid"
import UploadAvatarModal from "@/components/upload-avatar-modal"
import { useSession } from "@supabase/auth-helpers-react"
import LightboxModal from "@/components/lightbox-modal"
import { createClient } from "@/utils/supabase/component"

export default function UserPage() {
    const supabase = createClient()
    const router = useRouter()
    const { autoTranslate } = useAutoTranslate()
    const session = useSession()

    const userId = router.query.user_id
    const { entity: user } = useEntity(userId ? 'profiles' : null, userId)
    const { updateEntity: updateUser } = useEntity(session ? 'profiles' : null, 'me')
    const [lightboxOpen, setLightboxOpen] = useState(false)

    const [avatarFile, setAvatarFile] = useState(null)
    const uploadRef = useRef(null)

    const isMe = session && userId == session.user.id

    return (
        <div className="flex-center max-w-lg">
            <PageTitle title={user?.full_name || ""} />

            <Card fullWidth>
                <CardBody className="p-4">
                    <DragDropzone
                        size="lg"
                        label={autoTranslate("upload_avatar", "Upload Avatar")}
                        openRef={uploadRef}
                        onFiles={(files) => setAvatarFile(files[0])}
                        onError={(error) => toast(error.message, { color: 'danger' })}
                        className="gap-4 flex flex-col"
                    >
                        <div className="flex gap-4 items-center">
                            <Skeleton isLoaded={!!user} className="rounded-full -mb-1">
                                <Badge
                                    isOneChar
                                    as={Button}
                                    className={!isMe ? "hidden" : "!size-7"}
                                    size="lg"
                                    onPress={() => uploadRef.current()}
                                    shape="circle"
                                    placement="bottom-right"
                                    content={
                                        <PencilIcon className="size-3" />
                                    }
                                >
                                    <UserAvatar
                                        as={(user?.avatar_url || isMe) ? Button : null}
                                        isIconOnly
                                        user={user}
                                        size="lg"
                                        className="!size-20 text-3xl"
                                        onPress={() => isMe ? uploadRef.current() : setLightboxOpen(true)}
                                    />
                                </Badge>
                            </Skeleton>

                            <div className="flex flex-col gap-1 items-start">
                                <Skeleton isLoaded={!!user} className="rounded-xl">
                                    <p className="font-semibold">
                                        {user?.full_name || "Unnamed"}
                                    </p>
                                </Skeleton>

                                <Skeleton isLoaded={!!user} className="rounded-xl">
                                    <p className="text-foreground-400 text-small">
                                        <AutoTranslate tKey="subscription">
                                            Subscription:
                                        </AutoTranslate>

                                        <span className={cn('ml-1.5', user?.claims?.premium ? "text-success font-semibold" : "text-foreground font-light")}>
                                            {user?.claims?.premium ?
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
                                </Skeleton>
                            </div>
                        </div>

                        {user?.bio && (
                            <>
                                <Divider />

                                <p className="font-light text-small">
                                    {user?.bio}
                                </p>
                            </>
                        )}
                    </DragDropzone>
                </CardBody>
            </Card>

            <LightboxModal
                open={lightboxOpen && user?.avatar_url}
                setOpen={setLightboxOpen}
                slides={[{ src: user?.avatar_url }]}
            />

            <UploadAvatarModal
                avatarFile={avatarFile}
                setAvatarFile={setAvatarFile}
                onUpload={async (url) => {
                    supabase.auth.updateUser({ data: { avatar_url: url } })
                    const { error } = await updateUser({ avatar_url: url })
                    error && toast(error.message, { color: "danger" })
                }}
                onError={(error) => toast(error.message, { color: 'danger' })}
            />
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

    return { props: { ...translationProps, overrideTitle: true, canGoBack: true } }
}
