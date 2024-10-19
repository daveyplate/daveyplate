import { useEffect, useState } from 'react'

import { useSWRConfig } from 'swr'
import { useSession, useUser } from '@supabase/auth-helpers-react'

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'

import { getStaticPaths as getExportStaticPaths } from "@/lib/get-static"
import { getTranslationProps } from '@/lib/translation-props'
import { isExport } from "@/utils/utils"
import { patchAPI } from '@/utils/utils'

import {
    Button,
    Card,
    CardBody,
    Input,
    Textarea,
    Skeleton,
    Spinner
} from "@nextui-org/react"

import { toast } from "@/components/toast-provider"
import { useEntity } from '@daveyplate/supabase-swr-entities'

export default function EditProfile() {
    const { autoTranslate } = useAutoTranslate()
    const session = useSession()
    const { entity: user } = useEntity(session ? 'profiles' : null, 'me')
    const { mutate } = useSWRConfig()

    const [isUpdating, setIsUpdating] = useState(false)

    const [name, setName] = useState(user?.full_name || '')
    const [bio, setBio] = useState(user?.bio || '')
    const [nameError, setNameError] = useState(null)
    const [bioError, setBioError] = useState(null)

    const maxBioLength = 500

    const formChanged = bio != user?.bio || name != user?.full_name

    const nameRequired = autoTranslate('name_required', "Name is required")
    const minName = autoTranslate('min_name', "Name must be at least 2 characters")
    const maxBio = autoTranslate('max_bio', `Bio must be less than ${maxBioLength} characters`)
    const profileError = autoTranslate('profile_error', 'Error updating profile')
    const profileUpdated = autoTranslate('profile_updated', 'Profile updated')

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

        setIsUpdating(true)

        // Only send the fields that have changed
        const params = {}

        if (name != user.full_name) {
            params.name = name
        }

        if (bio != user.bio) {
            params.bio = bio
        }

        const { error } = await patchAPI(session, '/api/users/me', params)

        if (error) {
            console.error(error)
            toast(profileError, { color: "danger" })
        } else {
            await mutate('/api/users/me')
            mutate('/api/users')

            toast(profileUpdated)
        }

        setIsUpdating(false)
    }

    // Set the form values when the user initially loads
    useEffect(() => {
        if (user) {
            setName(user.full_name || '')
            setBio(user.bio || '')
        }
    }, [user])

    // Force reload the user on page load
    useEffect(() => {
        mutate('/api/users/me')
    }, [])

    // Validate the form when the user changes the name or bio
    useEffect(() => {
        validateForm()
    }, [name, bio])

    return (
        <div className="flex-container flex-center max-w-lg">
            <h2>
                <AutoTranslate tKey="title">
                    Edit Profile
                </AutoTranslate>
            </h2>

            <Card className="w-full">
                <CardBody as="form" onSubmit={updateProfile} className="p-5 gap-4">
                    <Input
                        variant="bordered"
                        size="lg"
                        label={autoTranslate("name", "Name")}
                        labelPlacement="outside"
                        isDisabled={!user || isUpdating}
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
                        isDisabled={!user || isUpdating}
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
                            className={!user && "invisible"}
                            color="primary"
                            size="lg"
                            isDisabled={!user || isUpdating || !formChanged || !!nameError || !!bioError}
                            onClick={updateProfile}
                            isLoading={isUpdating}
                            spinner={<Spinner color="current" size="sm" />}
                        >
                            {isUpdating ? (
                                <AutoTranslate tKey="saving">
                                    Saving...
                                </AutoTranslate>
                            ) : (
                                <AutoTranslate tKey="save_changes">
                                    Save Changes
                                </AutoTranslate>
                            )}
                        </Button>
                    </Skeleton>
                </CardBody>
            </Card>
        </div>
    )
}

export async function getStaticProps({ locale, ...context }) {
    const translationProps = await getTranslationProps({ locale, ...context })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getExportStaticPaths : undefined