import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import Compressor from 'compressorjs'
import { useSWRConfig } from "swr"
import AvatarEditor from 'react-avatar-editor'
import { useDropzone } from 'react-dropzone'

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'

import { createClient as createAdminClient } from "@/utils/supabase/service-role"
import { createClient } from "@/utils/supabase/component"
import { useUser } from "@supabase/auth-helpers-react"

import { getTranslationProps } from "@/lib/translation-props"
import { getStaticPaths as getExportStaticPaths } from "@/lib/get-static"
import { useCache } from "@/components/cache-provider"

import {
    Button,
    Card,
    CardBody,
    Skeleton,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Slider,
    Badge,
    cn
} from "@nextui-org/react"

import Link from "@/components/locale-link"
import UserAvatar from "@/components/user-avatar"
import PageTitle from "@/components/page-title"
import { isExport } from "@/utils/utils"
import { toast } from "@/components/toast-provider"

import { CloudArrowUpIcon, PencilIcon } from "@heroicons/react/24/solid"

const avatarSize = 512

export default function UserPage({ user: fallbackData, locale }) {
    const me = useUser()
    const router = useRouter()
    const supabase = createClient()
    const { mutate } = useSWRConfig()
    const { autoTranslate } = useAutoTranslate()
    const { isOpen: newAvatarModalOpen, onOpen: openNewAvatarModal, onOpenChange: newAvatarModalChange } = useDisclosure()
    const { isOpen: avatarModalOpen, onOpen: openAvatarModal, onOpenChange: avatarModalChange } = useDisclosure()

    const user_id = fallbackData?.id || router.query.user_id
    const isMe = (me && me.id == user_id)

    const onDrop = useCallback(acceptedFiles => {
        const avatarFile = acceptedFiles[0]

        const objectURL = URL.createObjectURL(avatarFile)

        setNewAvatar(objectURL)
        setAvatarScale(1)
        openNewAvatarModal()
    }, [])

    const { getRootProps, getInputProps, open, isDragActive, fileRejections } = useDropzone({ onDrop, disabled: !isMe, accept: { 'image/*': [] } })

    const { data: user, isLoading } = useCache(
        user_id ?
            (isMe ? '/api/users/me' : `/api/users/${user_id}`)
            : null,
        { fallbackData })

    const editor = useRef(null)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [newAvatar, setNewAvatar] = useState(null)
    const [avatarScale, setAvatarScale] = useState(1);

    const userNotFound = autoTranslate("user_not_found", "User not found")
    const avatarError = autoTranslate("avatar_error", "Error uploading avatar")
    const invalidImage = autoTranslate("invalid_image", "Invalid image")

    useEffect(() => {
        if (fileRejections.length > 0) {
            toast(invalidImage, { color: "danger" })
        }
    }, [fileRejections])

    // Crop then upload the new avatar
    const cropAvatar = () => {
        setUploadingAvatar(true)
        newAvatarModalChange(false)

        const canvas = editor.current.getImage()

        // Convert the canvas blob to a file, then compress it
        canvas.toBlob(blob => {
            const avatarFile = new File([blob], "avatar.jpg", { type: "image/jpeg" })

            new Compressor(avatarFile, {
                // quality: 0.6,
                maxWidth: avatarSize,
                maxHeight: avatarSize,
                resize: "cover",
                mimeType: "image/jpeg",
                success(result) {
                    uploadAvatar(result)
                },
                error(error) {
                    console.error(error.message)
                    toast(avatarError, { color: "danger" })
                    setUploadingAvatar(false)
                }
            })
        }, 'image/jpeg')
    }

    const uploadAvatar = async (file) => {
        const fileName = `${user.id}.jpg`

        const { error } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, { upsert: true, cacheControl: 3600 })

        if (error) {
            console.error(error)
            toast(avatarError, { color: "danger" })
            setUploadingAvatar(false)
            return
        }

        // Update the user Avatar URL
        const avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}` + `?${new Date().getTime()}`
        const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } })

        if (updateError) {
            console.error(updateError)
            toast(avatarError, { color: "danger" })
            setUploadingAvatar(false)
            return
        }

        await mutate(`/api/users/me`)
        mutate(`/api/users/${user.id}`)

        setTimeout(() => {
            setUploadingAvatar(false)
        }, 500)
    }

    if (!isLoading && !user) {
        return (
            <div className="flex-container flex-center">
                <h2>
                    {userNotFound}
                </h2>
            </div>
        )
    }

    return (
        <>
            <PageTitle title={user?.full_name || ""} locale={locale} />

            <div className="flex-container flex-center max-w-sm">
                <h2 className="hidden sm:flex">
                    Profile
                </h2>

                <Card className="w-full" {...getRootProps()}>
                    <input {...getInputProps()} />

                    <CardBody className={cn("p-6 text-center items-center justify-center", isDragActive ? 'bg-foreground/5' : null)}>
                        <div className={cn("fixed flex gap-4 items-center", !isDragActive ? "invisible" : null)}>
                            <h4>
                                Upload Avatar
                            </h4>

                            <CloudArrowUpIcon className="size-10" />
                        </div>

                        <div className={cn("flex flex-col gap-4 items-center", isDragActive ? "invisible" : null)}>
                            <Skeleton isLoaded={!!user} className="max-w-fit rounded-xl">
                                <h3>
                                    {user?.full_name || "Unnamed"}
                                </h3>
                            </Skeleton>

                            <Badge
                                isOneChar
                                as={Button}
                                className={!isMe ? "hidden" : null}
                                size="lg"
                                onPress={open}
                                shape="circle"
                                placement="bottom-right"
                                content={
                                    <PencilIcon className="size-2.5" />
                                }
                            >
                                <Skeleton isLoaded={!!user && !uploadingAvatar} className="max-w-fit rounded-full">
                                    <UserAvatar
                                        as={Button}
                                        isIconOnly
                                        onPress={isMe ? open : openAvatarModal}
                                        style={{ cursor: 'pointer' }}
                                        className="!size-24 text-3xl"
                                        user={user}
                                    />
                                </Skeleton>
                            </Badge>

                            <Skeleton isLoaded={!!user} className="min-w-32 rounded-xl">
                                <p className="italic text-sm">
                                    {user?.bio || "No bio"}
                                </p>
                            </Skeleton>

                            <div className="flex flex-col gap-2 items-center">
                                <Skeleton isLoaded={!!user} className="rounded-xl">
                                    <p className="text-center">
                                        <AutoTranslate tKey="subscription">
                                            Subscription:
                                        </AutoTranslate>
                                    </p>
                                </Skeleton>

                                <Skeleton isLoaded={!!user} className="rounded-xl min-w-20">
                                    <p className={`text-center text-sm ` + (user?.claims?.premium ? "font-bold text-success" : "text-warning")}>
                                        {user?.claims?.premium ?
                                            <AutoTranslate tKey="active">
                                                Active
                                            </AutoTranslate>
                                            :
                                            <AutoTranslate tKey="inactive">
                                                Inactive
                                            </AutoTranslate>
                                        }
                                    </p>
                                </Skeleton>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {me && user?.id == me?.id &&
                    <Link href="/edit-profile">
                        <Button color="primary">
                            <AutoTranslate tKey="edit_profile">
                                Edit Profile
                            </AutoTranslate>
                        </Button>
                    </Link>
                }
            </div>

            <Modal isOpen={newAvatarModalOpen} onOpenChange={newAvatarModalChange} placement="center" hideCloseButton>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="justify-center">
                                <AutoTranslate tKey="crop_image">
                                    Crop Image
                                </AutoTranslate>
                            </ModalHeader>

                            <ModalBody className="items-center">
                                <AvatarEditor
                                    className="rounded-xl"
                                    borderRadius={256 / 2}
                                    ref={editor}
                                    image={newAvatar}
                                    width={256}
                                    height={256}
                                    scale={avatarScale}
                                />

                                <Slider
                                    size="lg"
                                    color="foreground"
                                    aria-label="Avatar Scale"
                                    className="w-[304px]"
                                    value={avatarScale}
                                    maxValue={3}
                                    minValue={1}
                                    step={0.01}
                                    onChange={(value) => setAvatarScale(value)}
                                />
                            </ModalBody>

                            <ModalFooter>
                                <Button variant="light" onPress={onClose} size="lg">
                                    <AutoTranslate tKey="cancel">
                                        Cancel
                                    </AutoTranslate>
                                </Button>

                                <Button color="primary" onPress={cropAvatar} size="lg">
                                    <AutoTranslate tKey="upload">
                                        Upload
                                    </AutoTranslate>
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal isOpen={avatarModalOpen} onOpenChange={avatarModalChange} placement="center" hideCloseButton>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="justify-center">
                                {user?.full_name}
                            </ModalHeader>

                            <ModalBody className="items-center">
                                <UserAvatar
                                    className="rounded-xl w-full h-auto !aspect-square text-8xl"
                                    user={user}
                                />
                            </ModalBody>

                            <ModalFooter className="justify-center">
                                <Button variant="light" onPress={onClose} size="lg">
                                    <AutoTranslate tKey="close">
                                        Close
                                    </AutoTranslate>
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export async function getStaticPaths() {
    if (isExport()) return getExportStaticPaths()

    return {
        paths: [],
        fallback: "blocking"
    }
}

export async function getStaticProps({ locale, params, ...context }) {
    const translationProps = await getTranslationProps({ locale, params, ...context })

    if (isExport()) return { props: { ...translationProps, overrideTitle: true } }

    const supabase = createAdminClient()
    const { data: user, error } = await supabase.from('users')
        .select('id, full_name, claims, avatar_url, bio')
        .eq('id', params.user_id)
        .eq('deactivated', false)
        .single()

    if (error) return { notFound: true }

    // Static pages are used for SEO and performance, and refreshed 60 seconds
    return {
        props: {
            ...translationProps,
            overrideTitle: true,
            user
        },
        revalidate: 60
    }
}
