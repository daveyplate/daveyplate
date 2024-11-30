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
    Badge,
    CardHeader
} from "@nextui-org/react"
import {
    CheckIcon, CloudArrowUpIcon, PencilIcon, TrashIcon, UserCircleIcon, UserIcon
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'

import useAuthenticatedPage from '@/hooks/useAuthenticatedPage'
import { createClient } from '@/utils/supabase/component'
import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { isExport } from "@/utils/utils"

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
        <div className="flex flex-col grow items-center justify-center p-4">
            <Card fullWidth className="max-w-xl p-2">
                <CardHeader className="flex flex-col items-start px-4 pb-0 pt-2">
                    <p className="text-large">
                        <AutoTranslate tKey="account_details">
                            Account Details
                        </AutoTranslate>
                    </p>
                </CardHeader>

                <CardBody as="form" onSubmit={updateProfile}>
                    <DragDropzone
                        size="lg"
                        label={autoTranslate("upload_avatar", "Upload Avatar")}
                        openRef={uploadRef}
                        onFiles={(files) => setAvatarFile(files[0])}
                        onError={(error) => toast.error(error.message)}
                        className="gap-4 flex flex-col"
                    >
                        <div className="flex items-center gap-1 -mb-3 text-small">
                            <UserCircleIcon className="size-4 text-primary hidden" />

                            <AutoTranslate tKey="avatar">
                                Avatar
                            </AutoTranslate>
                        </div>

                        <div className="flex items-center gap-3 mb-1">
                            <Skeleton isLoaded={!!user} className="rounded-full">
                                <Badge
                                    as={Button}
                                    variant="faded"
                                    className="bg-background"
                                    isOneChar
                                    content={
                                        <PencilIcon className="size-2.5 text-default-500" />
                                    }
                                    placement="bottom-right"
                                    shape="circle"
                                    onPress={() => uploadRef.current()}
                                >
                                    <UserAvatar
                                        as={Button}
                                        isIconOnly
                                        size="lg"
                                        user={user}
                                        onPress={() => uploadRef.current()}
                                    />
                                </Badge>
                            </Skeleton>

                            <Button
                                className="ms-1"
                                color="primary"
                                startContent={
                                    <CloudArrowUpIcon className="size-5" />
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
                                <TrashIcon className="size-4" />
                            </Button>
                        </div>

                        <Input
                            label={
                                <div className="flex items-center gap-1">
                                    <UserIcon className="size-4 text-primary hidden" />

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
                            classNames={{ inputWrapper: "!min-h-[76px]" }}
                            label={
                                <div className="flex items-center gap-1">
                                    <PencilIcon className="size-4 text-primary hidden" />

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

                        <Skeleton isLoaded={!!user} className="self-end rounded-2xl min-w-10 me-2 -mt-2">
                            <p className="text-right text-tiny text-default-500">
                                {bio.length}/{maxBioLength}
                            </p>
                        </Skeleton>

                        <Skeleton isLoaded={!!user} className="max-w-fit rounded-2xl">
                            <Button
                                type="submit"
                                className={cn(!user && "invisible", null)}
                                color="primary"
                                isDisabled={!user || !formChanged || !!nameError || !!bioError}
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
                onError={(error) => toast.error(error.message)}
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