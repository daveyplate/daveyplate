import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'
import { postAPI, useEntity } from '@daveyplate/supabase-swr-entities'
import { ConfirmModal } from "@daveyplate/nextui-confirm-modal"

import {
    Button,
    Card,
    CardBody,
    Input,
    Spinner,
} from "@nextui-org/react"

import { createClient } from '@/utils/supabase/component'
import { getStaticPaths as getExportStaticPaths } from "@/utils/get-static"
import { getTranslationProps } from '@/utils/translation-props'
import { isExport } from "@/utils/utils"
import useAuthenticatedPage from '@/hooks/useAuthenticatedPage'

import { toast } from '@/components/providers/toast-provider'
import { ArrowLeftStartOnRectangleIcon, CheckIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon, KeyIcon, NoSymbolIcon, TrashIcon, UserIcon } from '@heroicons/react/24/solid'
import Link, { localeHref } from '@/components/locale-link'

export default function Settings({ locale }) {
    const router = useRouter()
    const supabase = createClient()
    const { autoTranslate } = useAutoTranslate()
    const { session } = useAuthenticatedPage({ locale })

    const { entity: user, updateEntity: updateUser, deleteEntity: deleteUser } = useEntity(session ? 'profiles' : null, 'me', null, { revalidateOnFocus: false })
    const [confirm, setConfirm] = useState(null)

    const [email, setEmail] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [password, setPassword] = useState('')

    const [isVisible, setIsVisible] = useState(false)

    const [nonce, setNonce] = useState('')
    const [requireNonce, setRequireNonce] = useState(false)

    const [updatingEmail, setUpdatingEmail] = useState(false)
    const [updatingPassword, setUpdatingPassword] = useState(false)
    const [loadingPortal, setLoadingPortal] = useState(false)

    const confirmEmail = autoTranslate('confirm_email', 'Check your email to confirm update')
    const deactivateText = autoTranslate('deactivate', 'Deactivate')
    const deactivateAccountText = autoTranslate('deactivate_account', 'Deactivate Account')
    const deactivateConfirm = autoTranslate('deactivate_confirm', 'Are you sure you want to deactivate your account? Your account will be reactivated when you login again.')
    const deleteText = autoTranslate('delete', 'Delete')
    const deleteAccountText = autoTranslate('delete_account', 'Delete Account')
    const deleteConfirm = autoTranslate('delete_confirm', 'Are you sure you want to delete your account? This deletion is permanent and cannot be undone.')
    const changePasswordText = autoTranslate('change_password', 'Change Password')
    const portalError = autoTranslate('portal_error', 'Customer portal error')
    const passwordChanged = autoTranslate('password_changed', 'Your password has been changed')
    const accountDeactivated = autoTranslate('account_deactivated', 'Account deactivated')
    const accountDeleted = autoTranslate('account_deleted', 'Account deleted')
    const updatingText = autoTranslate('updating', 'Updating...')
    const loadingText = autoTranslate('loading', 'Loading...')
    const authenticationCodeText = autoTranslate('authentication_code', 'Authentication Code')
    const checkEmailText = autoTranslate('check_email', 'Check your email for an authentication code')

    useEffect(() => {
        setEmail(session?.user.email || '')
    }, [session])

    const updateEmail = async (e) => {
        e.preventDefault()

        setUpdatingEmail(true)

        const { error } = await supabase.auth.updateUser({ email: email })

        setUpdatingEmail(false)

        if (error) {
            console.error(error)
            toast(error.message, { color: 'danger' })
        } else {
            setNewEmail(email)
            toast(confirmEmail)
        }
    }

    const updatePassword = async (e) => {
        e.preventDefault()

        setUpdatingPassword(true)

        // Prepare parameters for updating the password
        const params = { password }

        if (requireNonce) {
            params.nonce = nonce
        }

        // Attempt to update the password
        const { error } = await supabase.auth.updateUser(params)

        // Reauthenticate the user if the nonce is required
        if (error?.message?.includes('reauthentication')) {
            // Require Nonce for password update
            const { error } = await supabase.auth.reauthenticate()
            setUpdatingPassword(false)

            if (error) {
                console.error(error)
                toast(error.message, { color: 'danger' })
                return
            }

            toast(checkEmailText, { color: 'warning' })
            setRequireNonce(true)
            return
        }

        // Clear the nonce and requireNonce state
        setNonce('')
        setRequireNonce(false)
        setUpdatingPassword(false)

        if (error) {
            toast(error.message, { color: 'danger' })
        } else {
            setPassword('')

            toast(passwordChanged, { color: 'success' })

            // Sign out other devices
            supabase.auth.signOut({ scope: 'others' })
        }
    }

    const deactivateAccount = async () => {
        const { error } = await updateUser(user, { deactivated: true })

        if (error) {
            toast(error.message, { color: 'danger' })
        } else {
            toast(accountDeactivated, { color: 'warning' })
            router.replace(localeHref('/logout', locale))
        }
    }

    const deleteAccount = async () => {
        const { error } = await deleteUser()

        if (error) {
            toast(error.message, { color: 'danger' })
        } else {
            toast(accountDeleted, { color: 'danger' })
            router.replace(localeHref('/logout', locale))
        }
    }

    const manageSubscription = () => {
        setLoadingPortal(true)

        // Redirect user to Stripe Portal for subscription management
        postAPI(session, '/api/stripe/portal-session').then((res) => {
            router.push(res.data.url)
        }).catch((error) => {
            console.error(error)
            toast(portalError, { color: 'danger' })
            setLoadingPortal(false)
        })
    }

    return (
        <div className="flex-center max-w-xl">
            {/* Change Email */}
            <Card fullWidth>
                <CardBody className="p-4 gap-4 items-start" as="form" onSubmit={updateEmail}>
                    <Input
                        type="email"
                        size="lg"
                        variant="bordered"
                        label={
                            <div className="flex gap-2.5 items-center">
                                <EnvelopeIcon className="size-4 text-primary" />

                                <AutoTranslate tKey="change_email">
                                    Change Email
                                </AutoTranslate>
                            </div>
                        }
                        labelPlacement="outside"
                        placeholder={session ? autoTranslate('email_address', 'Email Address') : ' '}
                        value={email}
                        onValueChange={(value) => setEmail(value)}
                        isDisabled={updatingEmail}
                    />

                    <Button
                        type="submit"
                        color="primary"
                        size="lg"
                        isDisabled={updatingEmail || email == session?.user?.email || email == newEmail}
                        isLoading={updatingEmail}
                        spinner={<Spinner color="current" size="sm" />}
                        startContent={!updatingEmail && <CheckIcon className="size-5 -ms-1" />}
                    >
                        {updatingEmail ? (
                            updatingText
                        ) : (
                            <AutoTranslate tKey="update_email">
                                Update Email
                            </AutoTranslate>
                        )}
                    </Button>
                </CardBody>
            </Card>

            {/* Change Password */}
            <Card fullWidth>
                <CardBody className="p-4 gap-4 items-start" as="form" onSubmit={updatePassword}>
                    <input type="hidden" name="email" value={session?.user?.email} />

                    <Input
                        size="lg"
                        labelPlacement="outside"
                        variant="bordered"
                        type={isVisible ? "text" : "password"}
                        name="password"
                        value={password}
                        onValueChange={(value) => setPassword(value)}
                        label={
                            <div className="flex gap-2.5 items-center">
                                <KeyIcon className="size-4 text-primary" />

                                {changePasswordText}
                            </div>
                        }
                        placeholder={autoTranslate('new_password', 'New Password')}
                        isDisabled={!session || updatingPassword}
                        endContent={
                            <Button size="sm" variant="light" isIconOnly onPress={() => setIsVisible(!isVisible)} disableRipple>
                                {isVisible ? (
                                    <EyeSlashIcon className="size-6" />
                                ) : (
                                    <EyeIcon className="size-6" />
                                )}
                            </Button>
                        }
                    />

                    {requireNonce && (
                        <Input
                            autoFocus
                            size="lg"
                            labelPlacement="outside"
                            variant="bordered"
                            type="text"
                            value={nonce}
                            onValueChange={(value) => setNonce(value)}
                            label={
                                <div className="flex gap-2 items-center">
                                    <HashtagIcon className="size-4 text-primary" />

                                    {authenticationCodeText}
                                </div>
                            }
                            placeholder={authenticationCodeText}
                            isDisabled={updatingPassword}
                        />
                    )}

                    <Button
                        type="submit"
                        size="lg"
                        color="primary"
                        isDisabled={updatingPassword || password.length == 0 || (requireNonce && nonce.length == 0)}
                        isLoading={updatingPassword}
                        spinner={<Spinner color="current" size="sm" />}
                        startContent={!updatingPassword && <CheckIcon className="size-5 -ms-1" />}
                    >
                        {updatingPassword ? (
                            updatingText
                        ) : (
                            <AutoTranslate tKey="update_password">
                                Update Password
                            </AutoTranslate>
                        )}
                    </Button>
                </CardBody>
            </Card>

            {/* Account Management */}
            <Card fullWidth>
                <CardBody className="gap-4 flex p-4 items-start">
                    <div className="flex gap-2 items-center -my-1">
                        <UserIcon className="size-4 text-primary" />

                        <AutoTranslate tKey="manage_account">
                            Manage Account
                        </AutoTranslate>
                    </div>

                    {user?.premium && (
                        <Button
                            onPress={manageSubscription}
                            isDisabled={loadingPortal}
                            size="lg"
                            isLoading={loadingPortal}
                            spinner={<Spinner color="current" size="sm" />}
                        >
                            {loadingPortal ? (
                                loadingText
                            ) : (
                                <AutoTranslate tKey="manage_subscription">
                                    Manage Subscription
                                </AutoTranslate>
                            )}
                        </Button>
                    )}

                    <Button
                        as={Link}
                        size="lg"
                        href="/logout"
                        startContent={<ArrowLeftStartOnRectangleIcon className="size-5 -ms-1.5 me-[1px]" />}
                    >
                        <AutoTranslate tKey="logout">
                            Log Out
                        </AutoTranslate>
                    </Button>

                    <Button
                        color="warning"
                        onPress={() => {
                            setConfirm({
                                title: deactivateAccountText,
                                content: deactivateConfirm,
                                label: deactivateText,
                                action: deactivateAccount,
                                color: 'warning'
                            })
                        }}
                        size="lg"
                        startContent={<NoSymbolIcon className="size-5 -ms-1" />}
                    >
                        <AutoTranslate tKey="deactivate_account">
                            Deactivate Account
                        </AutoTranslate>
                    </Button>

                    <Button
                        color="danger"
                        onPress={() => {
                            setConfirm({
                                title: deleteAccountText,
                                content: deleteConfirm,
                                label: deleteText,
                                action: deleteAccount,
                                color: 'danger'
                            })
                        }}
                        size="lg"
                        startContent={<TrashIcon className="size-5 -ms-1" />}
                    >
                        <AutoTranslate tKey="delete_account">
                            Delete Account
                        </AutoTranslate>
                    </Button>
                </CardBody>
            </Card>

            <ConfirmModal confirm={confirm} setConfirm={setConfirm} />
        </div>
    )
}

export async function getStaticProps({ locale, ...context }) {
    const translationProps = await getTranslationProps({ locale, ...context })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getExportStaticPaths : undefined