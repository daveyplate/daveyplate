import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import { useLocale } from "next-intl"
import { useSession } from "@supabase/auth-helpers-react"

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'
import { getLocaleValue, isExport, useEntity } from "@daveyplate/supabase-swr-entities/client"
import { PageTitle } from "@daveyplate/next-page-title"
import { OpenGraph } from "@daveyplate/next-open-graph"
import { DragDropzone } from "@daveyplate/tailwind-drag-dropzone"

import {
    Badge,
    Button,
    Card,
    CardBody,
    cn,
    Divider,
    Skeleton
} from "@nextui-org/react"

import { PencilIcon } from "@heroicons/react/24/solid"

import { getTranslationProps } from "@/i18n/translation-props"
import { createClient } from "@/utils/supabase/component"

import UserAvatar from "@/components/user-avatar"
import { toast } from "@/components/providers/toast-provider"
import UploadAvatarModal from "@/components/upload-avatar-modal"
import LightboxModal from "@/components/lightbox-modal"
import OptionsDropdown from "@/components/options-dropdown"

export default function UserPage({ user_id, user: fallbackData }) {
    const supabase = createClient()
    const locale = useLocale()
    const router = useRouter()
    const { autoTranslate } = useAutoTranslate()
    const session = useSession()

    const userId = user_id || router.query.user_id
    const { entity: user, isLoading: userLoading } = useEntity(userId && 'profiles', userId, { lang: locale }, { fallbackData })
    const { updateEntity: updateUser } = useEntity(session ? 'profiles' : null, 'me')
    const [lightboxOpen, setLightboxOpen] = useState(false)

    const [avatarFile, setAvatarFile] = useState(null)
    const uploadRef = useRef(null)

    const isMe = session && userId == session.user.id
    const localizedBio = getLocaleValue(user?.bio, locale, user?.locale)

    useEffect(() => {
        if (userId && !userLoading && !user) {
            router.replace('/404')
        }
    }, [userId, user, userLoading])

    return (
        <div className="flex-center max-w-lg">
            <PageTitle title={user?.full_name} />

            <OpenGraph
                title={user?.full_name || "Profile"}
                description={localizedBio || `User Profile: ${user?.full_name}`}
                image={user?.avatar_url}
                ogType="profile"
            />

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
                                        as={Button}
                                        isIconOnly
                                        disabled={!user?.avatar_url && !isMe}
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

                            <div className="self-start ms-auto -mt-2 -me-1.5">
                                <OptionsDropdown />
                            </div>
                        </div>

                        {localizedBio && (
                            <>
                                <Divider />

                                <p className="font-light text-small">
                                    {localizedBio}
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
                    updateUser({ avatar_url: url })
                }}
                onError={(error) => toast(error.message, { color: 'danger' })}
            />
        </div>
    )
}

export async function getStaticProps({ locale, params }) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined