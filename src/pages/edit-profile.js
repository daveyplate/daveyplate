import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'use-intl'

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'
import { getLocaleValue, useEntity } from '@daveyplate/supabase-swr-entities/client'
import { DragDropzone } from '@daveyplate/tailwind-drag-dropzone'
import { ConfirmModal } from '@daveyplate/nextui-confirm-modal'

import {
    Button,
    Card,
    CardBody,
    Input,
    Textarea,
    Skeleton,
    cn,
    Badge
} from "@nextui-org/react"

import {
    CheckIcon, CloudArrowUpIcon, PencilIcon, TrashIcon, UserCircleIcon, UserIcon
} from '@heroicons/react/24/solid'

import useAuthenticatedPage from '@/hooks/useAuthenticatedPage'
import { createClient } from '@/utils/supabase/component'
import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { isExport } from "@/utils/utils"

import { toast } from "@/components/providers/toast-provider"
import UserAvatar from '@/components/user-avatar'
import UploadAvatarModal from '@/components/upload-avatar-modal'

export default function EditProfile() {
    const supabase = createClient()
    const locale = useLocale()
    const { autoTranslate } = useAutoTranslate()
    const { session } = useAuthenticatedPage()
    const { entity: user, updateEntity: updateUser } = useEntity(session ? 'profiles' : null, 'me', null, { revalidateOnFocus: false })
    const localizedBio = getLocaleValue(user?.bio, locale)

    const [name, setName] = useState(user?.full_name || '')
    const [bio, setBio] = useState(localizedBio || '')
    const [nameError, setNameError] = useState(null)
    const [bioError, setBioError] = useState(null)
    const [avatarFile, setAvatarFile] = useState(null)
    const [confirm, setConfirm] = useState(null)

    const uploadRef = useRef(null)

    const maxBioLength = 500

    const formChanged = bio != localizedBio || name != user?.full_name

    const nameRequired = autoTranslate('name_required', "Name is required")
    const minName = autoTranslate('min_name', "Name must be at least 2 characters")
    const maxBio = autoTranslate('max_bio', `Bio must be less than ${maxBioLength} characters`)

    const validateForm = () => {
        if (!user) return

        if (name.length < 2) {
            setNameError(minName)
        } else if (name.length == 0) {
            setNameError(nameRequired)
        } else {
            setNameError(null)
        }

        if (bio.length > maxBioLength) {
            setBioError(maxBio)
        } else {
            setBioError(null)
        }
    }

    const updateProfile = async (e) => {
        e.preventDefault()
        if (!formChanged) return

        // Only send the fields that have changed
        const params = { locale }

        if (name != user.full_name) {
            params.full_name = name

            supabase.auth.updateUser({ data: { full_name: name } })
        }

        if (bio != localizedBio) {
            params.bio = { [locale]: bio }
        }

        updateUser(params)
    }

    // Set the form values when the user initially loads
    useEffect(() => {
        if ((name || bio) && formChanged) return

        setName(user?.full_name || '')
        setBio(localizedBio || '')
    }, [user])

    useEffect(() => {
        setBio(localizedBio || '')
    }, [locale])

    // Validate the form when the user changes the name or bio
    useEffect(() => {
        validateForm()
    }, [name, bio])

    return (
        <div className="flex-center max-w-lg">
            <Card fullWidth>
                <CardBody as="form" onSubmit={updateProfile} className="p-4">
                    <DragDropzone
                        size="lg"
                        label={autoTranslate("upload_avatar", "Upload Avatar")}
                        openRef={uploadRef}
                        onFiles={(files) => setAvatarFile(files[0])}
                        onError={(error) => toast(error.message, { color: 'danger' })}
                        className="gap-4 flex flex-col"
                    >
                        <div className="flex items-center gap-2 -mb-2 -mt-1">
                            <UserCircleIcon className="size-5 text-primary" />

                            <AutoTranslate tKey="avatar">
                                Avatar
                            </AutoTranslate>
                        </div>

                        <div className="flex items-center gap-4 mb-1">
                            <Badge
                                isOneChar
                                as={Button}
                                size="lg"
                                onPress={() => uploadRef.current()}
                                shape="circle"
                                placement="bottom-right"
                                content={
                                    <PencilIcon className="size-2.5" />
                                }
                            >
                                <Skeleton isLoaded={!!user} className="rounded-full">
                                    <UserAvatar
                                        as={Button}
                                        isIconOnly
                                        onPress={() => uploadRef.current()}
                                        user={user}
                                        size="lg"
                                    />
                                </Skeleton>
                            </Badge>

                            <Button
                                size="lg"
                                className="mt-1 ms-1"
                                color="primary"
                                startContent={
                                    <CloudArrowUpIcon className="size-6 -ms-1" />
                                }
                                onPress={() => uploadRef.current()}
                                isDisabled={!user}
                            >
                                <AutoTranslate tKey="upload">
                                    Upload
                                </AutoTranslate>
                            </Button>

                            <Button
                                isIconOnly
                                className="mt-1"
                                size="lg"
                                color="danger"
                                onPress={() => setConfirm({
                                    title: autoTranslate('delete_avatar', 'Delete Avatar'),
                                    content: autoTranslate('delete_avatar_message', 'Are you sure you want to delete your avatar?'),
                                    label: autoTranslate('delete', 'Delete'),
                                    color: "danger",
                                    icon: <TrashIcon className="size-5 -ms-1" />,
                                    action: async () => {
                                        supabase.auth.updateUser({ data: { avatar_url: null } })
                                        updateUser({ avatar_url: null })
                                    }
                                })}
                                isDisabled={!user?.avatar_url}
                            >
                                <TrashIcon className="size-5" />
                            </Button>
                        </div>

                        <Input
                            variant="bordered"
                            size="lg"
                            label={
                                <div className="flex items-center gap-2">
                                    <UserIcon className="size-4 text-primary" />

                                    <AutoTranslate tKey="name">
                                        Name
                                    </AutoTranslate>
                                </div>
                            }
                            labelPlacement="outside"
                            isDisabled={!user}
                            placeholder={user ? autoTranslate('name_placeholder', 'Name') : ' '}
                            value={name}
                            onValueChange={setName}
                            isInvalid={!!nameError}
                            errorMessage={nameError}
                        />

                        <Textarea
                            variant="bordered"
                            size="lg"
                            classNames={{ label: "text-base", inputWrapper: "!min-h-24" }}
                            label={
                                <div className="flex items-center gap-2">
                                    <PencilIcon className="mx-0.5 size-3.5 text-primary" />

                                    <AutoTranslate tKey="bio">
                                        Bio
                                    </AutoTranslate>
                                </div>
                            }
                            labelPlacement="outside"
                            isDisabled={!user}
                            placeholder={user ? autoTranslate('bio_placeholder', 'Type your bio here') : ' '}
                            value={bio}
                            onValueChange={setBio}
                            isInvalid={!!bioError}
                            errorMessage={bioError}
                        />

                        <Skeleton isLoaded={!!user} className="self-end rounded-2xl min-w-10 me-2 -mt-2 -mb-1">
                            <p className="text-right text-small text-foreground/60">
                                {bio.length}/{maxBioLength}
                            </p>
                        </Skeleton>

                        <Skeleton isLoaded={!!user} className="max-w-fit rounded-2xl">
                            <Button
                                type="submit"
                                className={cn(!user && "invisible", null)}
                                color="primary"
                                size="lg"
                                isDisabled={!user || !formChanged || !!nameError || !!bioError}
                                startContent={<CheckIcon className="size-5 -ms-1" />}
                            >
                                <AutoTranslate tKey="save_changes">
                                    Save Changes
                                </AutoTranslate>
                            </Button>
                        </Skeleton>
                    </DragDropzone>
                </CardBody>
            </Card>

            <UploadAvatarModal
                avatarFile={avatarFile}
                setAvatarFile={setAvatarFile}
                onUpload={async (url) => {
                    supabase.auth.updateUser({ data: { avatar_url: url } })
                    updateUser({ avatar_url: url })
                }}
                onError={(error) => toast(error.message, { color: 'danger' })}
            />

            <ConfirmModal
                confirm={confirm}
                setConfirm={setConfirm}
            />
        </div>
    )
}

export async function getStaticProps({ locale, params }) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined