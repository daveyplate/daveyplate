import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { createClient } from '@/utils/supabase/component'
import { useSessionContext } from '@supabase/auth-helpers-react'

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'

import { getStaticPaths as getExportStaticPaths } from "@/lib/get-static"
import { getTranslationProps } from '@/lib/translation-props'
import { isExport } from "@/utils/utils"
import { localeHref } from '@/components/locale-link'

import { Button, Card, CardBody, Input, Spinner } from "@nextui-org/react"

import { toast } from '@/components/toast-provider'

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'

export default function ResetPassword({ locale }) {
    const router = useRouter()
    const { session, isLoading } = useSessionContext()
    const supabase = createClient()
    const { autoTranslate } = useAutoTranslate()

    const [password, setPassword] = useState('')
    const [updatingPassword, setUpdatingPassword] = useState(false)

    const passwordChanged = autoTranslate('password_changed', 'Your password has been changed')
    const passwordError = autoTranslate('password_error', 'Error updating password')
    const savingText = autoTranslate('saving', 'Saving...')

    const [isVisible, setIsVisible] = useState(false)

    const toggleVisibility = () => setIsVisible(!isVisible)

    useEffect(() => {
        if (!isLoading && !session) {
            router.replace(localeHref('/login', locale))
        }
    }, [session, isLoading])

    const updatePassword = async (e) => {
        e.preventDefault()

        setUpdatingPassword(true)

        const { error } = await supabase.auth.updateUser({ password })

        setPassword('')
        setUpdatingPassword(false)

        if (error) {
            toast(passwordError, { color: 'danger' })
        } else {
            toast(passwordChanged, { color: 'success' })

            router.replace(localeHref("/", locale))

            // Sign out other devices
            supabase.auth.signOut({ scope: 'others' })
        }
    }

    return (
        <div className="flex-container flex-center max-w-sm">
            <h2 className="hidden sm:block">
                <AutoTranslate tKey="title">
                    Reset Password
                </AutoTranslate>
            </h2>

            {/* Change Password */}
            <Card className="w-full">
                <CardBody as="form" onSubmit={updatePassword} className="p-5 flex flex-col gap-4 items-start">

                    <Input
                        type={isVisible ? "text" : "password"}
                        variant="bordered"
                        size="lg"
                        value={password}
                        placeholder={autoTranslate("password", "Password")}
                        label={autoTranslate("new_password", "New Password")}
                        labelPlacement="outside"
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={updatingPassword}
                        endContent={
                            <button type="button" onClick={toggleVisibility}>
                                {isVisible ? (
                                    <EyeSlashIcon className="size-6" />
                                ) : (
                                    <EyeIcon className="size-6" />
                                )}
                            </button>
                        }
                    />

                    <Button
                        type="submit"
                        size="lg"
                        disabled={updatingPassword || password.length == 0}
                        isLoading={updatingPassword}
                        spinner={<Spinner color="current" size="sm" />}
                        color="primary"
                    >
                        {updatingPassword ? (
                            savingText
                        ) : (
                            <AutoTranslate tKey="save_password">
                                Save Password
                            </AutoTranslate>
                        )}
                    </Button>
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