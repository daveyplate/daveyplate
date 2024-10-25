import { useState } from 'react'

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'

import { Button, Card, CardBody, Input, Spinner } from "@nextui-org/react"

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'

import { getStaticPaths as getExportStaticPaths } from "@/utils/get-static"
import { getTranslationProps } from '@/utils/translation-props'
import { createClient } from '@/utils/supabase/component'
import { isExport } from "@/utils/utils"

import useAuthenticatedPage from '@/hooks/useAuthenticatedPage'
import { useRouter as useLocaleRouter } from '@/i18n/routing'

import { toast } from '@/components/providers/toast-provider'

export default function ResetPassword() {
    useAuthenticatedPage()

    const localeRouter = useLocaleRouter()
    const supabase = createClient()
    const { autoTranslate } = useAutoTranslate()

    const [password, setPassword] = useState('')
    const [updatingPassword, setUpdatingPassword] = useState(false)

    const passwordChanged = autoTranslate('password_changed', 'Your password has been changed')
    const passwordError = autoTranslate('password_error', 'Error updating password')
    const savingText = autoTranslate('saving', 'Saving...')

    const [isVisible, setIsVisible] = useState(false)

    const toggleVisibility = () => setIsVisible(!isVisible)

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

            localeRouter.replace("/")

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
                        isDisabled={updatingPassword || password.length == 0}
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