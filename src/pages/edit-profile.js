import { useEffect, useRef, useState } from 'react'

import { useSession } from '@supabase/auth-helpers-react'

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'
import { useEntity } from '@daveyplate/supabase-swr-entities'
import { DragDropzone } from '@daveyplate/tailwind-drag-dropzone'

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

import { CheckIcon, CloudArrowUpIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid'

import { getStaticPaths as getExportStaticPaths } from "@/utils/get-static"
import { getTranslationProps } from '@/utils/translation-props'
import { isExport } from "@/utils/utils"

import { toast } from "@/components/providers/toast-provider"
import UserAvatar from '@/components/user-avatar'
import UploadAvatarModal from '@/components/upload-avatar-modal'
import { createClient } from '@/utils/supabase/component'

export default function EditProfile() {
    const { autoTranslate } = useAutoTranslate()
    const session = useSession()
    const supabase = createClient()
    const { entity: user, updateEntity: updateUser } = useEntity(session ? 'profiles' : null, 'me')

    const [name, setName] = useState(user?.full_name || '')
    const [bio, setBio] = useState(user?.bio || '')
    const [nameError, setNameError] = useState(null)
    const [bioError, setBioError] = useState(null)
    const [avatarFile, setAvatarFile] = useState(null)

    const uploadRef = useRef(null)

    const maxBioLength = 500

    const formChanged = bio != user?.bio || name != user?.full_name

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

    const updateProfile = async () => {
        if (!formChanged) return

        // Only send the fields that have changed
        const params = {}

        if (name != user.full_name) {
            params.full_name = name
        }

        if (bio != user.bio) {
            params.bio = bio
        }

        updateUser({ ...user, id: 'me' }, { ...params })
    }

    // Set the form values when the user initially loads
    useEffect(() => {
        if (user) {
            setName(user.full_name || '')
            setBio(user.bio || '')
        }
    }, [user])

    // Validate the form when the user changes the name or bio
    useEffect(() => {
        validateForm()
    }, [name, bio])

    return (
        <div className="flex-center max-w-xl">
            <h2 className="hidden sm:flex">
                <AutoTranslate tKey="title">
                    Edit Profile
                </AutoTranslate>
            </h2>

            <Card fullWidth>
                <CardBody as="form" onSubmit={updateProfile} className="p-5">
                    <DragDropzone
                        size="lg"
                        label={autoTranslate("upload_avatar", "Upload Avatar")}
                        openRef={uploadRef}
                        onFiles={(files) => setAvatarFile(files[0])}
                        onError={(error) => toast(error.message, { color: 'danger' })}
                        className="gap-4 flex flex-col"
                    >
                        <p className="-mb-2 -mt-1">
                            <AutoTranslate tKey="avatar">
                                Avatar
                            </AutoTranslate>
                        </p>

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
                                onPress={() => updateUser({ ...user, id: 'me' }, { avatar_url: null })}
                                isDisabled={!user?.avatar_url}
                            >
                                <TrashIcon className="size-5" />
                            </Button>
                        </div>

                        <Input
                            variant="bordered"
                            size="lg"
                            label={autoTranslate("name", "Name")}
                            labelPlacement="outside"
                            isDisabled={!user}
                            placeholder={user ? autoTranslate('name_placeholder', 'Name') : ' '}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            isInvalid={!!nameError}
                            errorMessage={nameError}
                        />

                        <Textarea
                            variant="bordered"
                            size="lg"
                            classNames={{ label: "text-base", inputWrapper: "!min-h-24" }}
                            label={autoTranslate("bio", "Bio")}
                            labelPlacement="outside"
                            isDisabled={!user}
                            placeholder={user ? autoTranslate('bio_placeholder', 'Type your bio here') : ' '}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            isInvalid={!!bioError}
                            errorMessage={bioError}
                        />

                        <Skeleton isLoaded={!!user} className="self-end rounded-2xl min-w-10 me-2 -mt-1 -mb-1">
                            <p className="text-right text-tiny text-foreground/60">
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
                                onClick={updateProfile}
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
                    const { error: updateError } = await updateUser({ ...user, id: 'me' }, { avatar_url: url })

                    if (updateError) {
                        console.error(updateError)
                        toast("Error updating avatar", { color: "danger" })
                    }
                }}
                onError={(error) => toast(error.message, { color: 'danger' })}
            />
        </div>
    )
}

export async function getStaticProps({ locale, ...context }) {
    const translationProps = await getTranslationProps({ locale, ...context })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getExportStaticPaths : undefined