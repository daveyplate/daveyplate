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
    CardHeader,
    cn,
    Skeleton
} from "@nextui-org/react"
import { PencilIcon, PhotoIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"

import { createClient } from "@/utils/supabase/component"
import { getTranslationProps } from "@/i18n/translation-props"
import { getLocalePaths } from "@/i18n/locale-paths"
import { Link } from "@/i18n/routing"

import UserAvatar from "@/components/user-avatar"
import LightboxModal from "@/components/lightbox-modal"
import OptionsDropdown from "@/components/options-dropdown"
import { CropImageModal, defaultLocalization } from "@daveyplate/nextui-crop-image-modal"

export default function UserPage({ user_id, user: fallbackData }) {
    const supabase = createClient()
    const locale = useLocale()
    const router = useRouter()
    const { autoTranslate } = useAutoTranslate()
    const session = useSession()

    const userId = user_id || router.query.user_id
    const { entity: user, isLoading: userLoading } = useEntity(userId && 'profiles', userId, { lang: locale }, { fallbackData })
    const { updateEntity: updateUser } = useEntity(session && 'profiles', 'me', { lang: locale })
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [bannerFile, setBannerFile] = useState(null)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [uploadingBanner, setUploadingBanner] = useState(false)
    const bannerUploadRef = useRef(null)
    const [avatarFile, setAvatarFile] = useState(null)

    const uploadRef = useRef(null)

    const isMe = session && userId == session.user.id
    const localizedBio = getLocaleValue(user?.bio, locale, user?.locale)

    const localization = {}
    for (const key in defaultLocalization) {
        localization[key] = autoTranslate(key, defaultLocalization[key])
    }

    useEffect(() => {
        if (userId && !userLoading && !user) {
            router.replace('/404')
        }
    }, [userId, user, userLoading])

    return (
        <div className="flex flex-col items-center my-10 grow p-4">
            <PageTitle title={user?.full_name} />

            <OpenGraph
                title={user?.full_name || "Profile"}
                description={localizedBio || `User Profile: ${user?.full_name}`}
                image={user?.avatar_url}
                ogType="profile"
            />

            <Card className="max-w-md" fullWidth>
                <CardHeader
                    className={cn((!user || user?.banner_url) ? "bg-default"
                        : "bg-gradient-to-br from-indigo-300 via-blue-300 to-primary-400 ",
                        "p-0 bg-contain bg-center"
                    )}
                    style={{
                        backgroundImage: user?.banner_url && `url(${user?.banner_url})`
                    }}
                >
                    <DragDropzone
                        size="sm"
                        label={autoTranslate("upload_banner", "Upload Banner")}
                        openRef={bannerUploadRef}
                        onFiles={(files) => setBannerFile(files[0])}
                        onError={(error) => toast.error(error.message)}
                        className="flex flex-col justify-end overflow-visible w-full h-full aspect-[4/1]"
                    >
                        <Skeleton isLoaded={!!user && !uploadingBanner} className="w-full h-full">
                            <Button
                                className={cn(isMe ? "opacity-100 " : "opacity-0",
                                    user?.banner_url ? "bg-background/40" : "bg-background/20",
                                    "absolute left-3 top-3"
                                )}
                                isIconOnly
                                radius="full"
                                size="sm"
                                variant="light"
                                isDisabled={!isMe}
                                onPress={() => bannerUploadRef.current()}
                            >
                                <PhotoIcon className="size-4" />
                            </Button>

                            <OptionsDropdown
                                className={cn(!isMe ? "opacity-100" : "opacity-0",
                                    user?.banner_url ? "bg-background/40" : "bg-background/20",
                                    "absolute right-3 top-3 transition-all text-white"
                                )}
                                variant="light"
                                isDisabled={isMe}
                            />

                            <Button
                                as={Link}
                                href="/edit-profile"
                                className={cn(isMe ? "opacity-100 " : "opacity-0",
                                    user?.banner_url ? "bg-background/40" : "bg-background/20",
                                    "absolute right-3 top-3"
                                )}
                                radius="full"
                                size="sm"
                                variant="light"
                                isDisabled={!isMe}
                            >
                                <AutoTranslate tKey="edit_profile">
                                    Edit Profile
                                </AutoTranslate>
                            </Button>
                        </Skeleton>
                    </DragDropzone>
                </CardHeader>

                <CardBody className="overflow-visible px-4">
                    <DragDropzone
                        size="lg"
                        label={autoTranslate("upload_avatar", "Upload Avatar")}
                        openRef={uploadRef}
                        onFiles={(files) => setAvatarFile(files[0])}
                        onError={(error) => toast.error(error.message)}
                        className="overflow-visible z-10"
                    >
                        <div className="pt-6 pb-1 flex flex-col">
                            <div className="-mt-20 -mb-2 mx-auto">
                                <Badge
                                    as={Button}
                                    isOneChar
                                    content={
                                        <PencilIcon className="size-2.5 text-default-500" />
                                    }
                                    placement="bottom-right"
                                    shape="circle"
                                    variant="faded"
                                    className="bg-background"
                                    isInvisible={!isMe}
                                    onPress={() => uploadRef.current()}
                                >
                                    <Skeleton isLoaded={!!user && !uploadingAvatar} className="rounded-full size-fit">
                                        <UserAvatar
                                            as={Button}
                                            isIconOnly
                                            className="h-20 w-20 text-xl"
                                            size="lg"
                                            user={user}
                                            onPress={() => setLightboxOpen(true)}
                                        />
                                    </Skeleton>
                                </Badge>
                            </div>

                            {!user ? (
                                <Skeleton className="rounded-full w-24 h-5 my-1" />
                            ) : (
                                <p className="text-large font-medium">
                                    {user && (user?.full_name || "Unnamed")}
                                </p>
                            )}


                            {!user ? (
                                <Skeleton className="rounded-full w-36 h-4 my-0.5" />
                            ) : (
                                <p className="max-w-[90%] text-small text-default-400">
                                    <AutoTranslate tKey="subscription">
                                        Subscription:
                                    </AutoTranslate>

                                    &nbsp;

                                    <span className={cn(user?.claims?.premium ? "text-success" : "text-foreground")}>
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
                            )}

                            {!user ? (
                                <Skeleton className="rounded-full w-64 h-4 mt-2 mb-1" />
                            ) : (
                                localizedBio && (
                                    <p className="pt-2 text-small text-foreground">
                                        {localizedBio}
                                    </p>
                                )
                            )}
                        </div>
                    </DragDropzone>
                </CardBody>
            </Card>

            <LightboxModal
                open={lightboxOpen && user?.avatar_url}
                setOpen={setLightboxOpen}
                slides={[{ src: user?.avatar_url }]}
            />

            <CropImageModal
                imageFile={avatarFile}
                setImageFile={setAvatarFile}
                imageSize={{ width: 512, height: 512 }}
                imageRadius="full"
                onConfirm={async (croppedImage) => {
                    setUploadingAvatar(true)
                    const fileName = `${userId}.jpg`
                    const { error: uploadError } = await supabase.storage
                        .from("avatars")
                        .upload(fileName, croppedImage, { upsert: true })

                    if (uploadError) {
                        setUploadingAvatar(false)
                        return toast.error(uploadError.message)
                    }

                    const avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/avatars/${fileName}` + `?${new Date().getTime()}`
                    const { error } = await updateUser({ avatar_url: avatarUrl })

                    setUploadingAvatar(false)
                    error && toast.error(error.message)
                }}
                onError={(error) => toast.error(error.message)}
                localization={localization}
            />

            <CropImageModal
                imageFile={bannerFile}
                setImageFile={setBannerFile}
                imageSize={{ width: 1600, height: 400 }}
                imageRadius="sm"
                onConfirm={async (croppedImage) => {
                    setUploadingBanner(true)

                    const fileName = `${userId}.jpg`
                    const { error: uploadError } = await supabase.storage
                        .from("banners")
                        .upload(fileName, croppedImage, { upsert: true })

                    if (uploadError) {
                        setUploadingBanner(false)
                        return toast.error(uploadError.message)
                    }

                    const bannerUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/banners/${fileName}` + `?${new Date().getTime()}`
                    const { error } = await updateUser({ banner_url: bannerUrl })

                    setUploadingBanner(false)
                    error && toast.error(error.message)
                }}
                onError={(error) => toast.error(error.message)}
                localization={localization}
            />
        </div>
    )
}

export async function getStaticProps({ locale, params }) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined