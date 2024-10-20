import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSWRConfig } from 'swr'

import { useSessionContext } from '@supabase/auth-helpers-react'

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'

import { createClient } from '@/utils/supabase/component'

import { getStaticPaths as getExportStaticPaths } from "@/utils/get-static"
import { getTranslationProps } from '@/utils/translation-props'
import { isExport, patchAPI, postAPI, deleteAPI } from "@/utils/utils"
import { useCache } from '@/components/providers/cache-provider'

import {
    Button,
    Card,
    CardBody,
    Input,
    Spinner,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@nextui-org/react"

import { toast } from '@/components/providers/toast-provider'
import { localeHref } from '@/components/locale-link'
import { useEntity } from '@daveyplate/supabase-swr-entities'

export default function Settings({ locale }) {
    const router = useRouter()
    const { autoTranslate } = useAutoTranslate()
    const { session, isLoading } = useSessionContext()
    const { entity: user } = useEntity(session ? 'profiles' : null, 'me')
    const { mutate } = useSWRConfig()

    const supabase = createClient()

    const { isOpen: deactivateModalOpen, onOpen: openDeactivateModal, onOpenChange: deactivateModalChange } = useDisclosure()
    const { isOpen: deleteModalOpen, onOpen: openDeleteModal, onOpenChange: deleteModalChange } = useDisclosure()
    const { isOpen: passwordModalOpen, onOpen: openPasswordModal, onOpenChange: passwordModalChange } = useDisclosure()

    const [email, setEmail] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [password, setPassword] = useState('')

    const [updatingEmail, setUpdatingEmail] = useState(false)
    const [updatingPassword, setUpdatingPassword] = useState(false)
    const [deactivating, setDeactivating] = useState(false)
    const [loadingPortal, setLoadingPortal] = useState(false)

    const confirmEmail = autoTranslate('confirm_email', 'Check your email to confirm update')
    const emailError = autoTranslate('email_error', 'Error updating email')
    const passwordError = autoTranslate('password_error', 'Error updating password')
    const deactivateError = autoTranslate('deactivate_error', 'Error deactivating account')
    const deleteError = autoTranslate('delete_error', 'Error deleting account')
    const portalError = autoTranslate('portal_error', 'Customer portal error')
    const passwordChanged = autoTranslate('password_changed', 'Your password has been changed')
    const accountDeactivated = autoTranslate('account_deactivated', 'Account deactivated')
    const accountDeleted = autoTranslate('account_deleted', 'Account deleted')
    const updatingText = autoTranslate('updating', 'Updating...')
    const loadingText = autoTranslate('loading', 'Loading...')

    useEffect(() => {
        if (user) {
            setEmail(user.email)
        }
    }, [user])

    useEffect(() => {
        if (!isLoading && !session) {
            router.replace(localeHref('/login?returnTo=/settings', locale), localeHref('/login', locale))
        }
    }, [isLoading, session])

    // Force reload the user on page load
    useEffect(() => {
        mutate('/api/users/me')
    }, [])

    const updateEmail = async (e) => {
        e.preventDefault()

        setUpdatingEmail(true)

        const { error } = await supabase.auth.updateUser({ email: email })

        setUpdatingEmail(false)

        if (error) {
            console.error(error)
            toast(emailError, { color: 'danger' })
        } else {
            setNewEmail(email)
            toast(confirmEmail)
        }
    }

    const updatePassword = async (e) => {
        e.preventDefault()

        setUpdatingPassword(true)

        const { error } = await supabase.auth.updateUser({ password })

        setPassword('')
        setUpdatingPassword(false)

        if (error) {
            console.error(error)
            toast(passwordError, { color: 'danger' })
        } else {
            toast(passwordChanged, { color: 'success' })

            // Sign out other devices
            supabase.auth.signOut({ scope: 'others' })
        }
    }

    const deactivateAccount = async () => {
        setDeactivating(true)

        const { error } = await patchAPI(session, '/api/users/me', { deactivated: true }).catch((error) => ({ error }))

        if (error) {
            console.error(error)
            toast(deactivateError, { color: 'danger' })
            setDeactivating(false)
        } else {
            toast(accountDeactivated, { color: 'warning' })
            mutate('/api/users')
            router.replace(localeHref('/logout', locale))
        }

    }

    const deleteAccount = async () => {
        setDeactivating(true)

        deleteAPI(session, '/api/users/me').then(async () => {
            toast(accountDeleted, { color: 'danger' })
            mutate('/api/users')
            router.replace(localeHref('/logout', locale))
        }).catch((error) => {
            console.error(error)
            toast(deleteError, { color: 'danger' })
            setDeactivating(false)
        })
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

    // Check if the user has signed in recently, required to change password
    const signedInRecently = () => {
        const now = new Date()
        const lastSignIn = new Date(session?.user?.last_sign_in_at)
        const diff = now.getTime() - lastSignIn.getTime()

        // 30 seconds during development
        if (process.env.NODE_ENV == 'development') {
            return diff < 30000
        }

        // 5 minutes in production
        return diff < 300000

        // Supabase allows up to 24 hours
        // return diff < 86400000
    }

    return (
        <div className="flex-container flex-center max-w-lg">
            <h2 className="hidden sm:flex">
                <AutoTranslate tKey="settings">
                    Settings
                </AutoTranslate>
            </h2>

            {/* Change Email */}
            <Card className="w-full">
                <CardBody className="p-4 gap-4 items-start" as="form" onSubmit={updateEmail}>
                    <Input
                        type="email"
                        size="lg"
                        variant="bordered"
                        label={autoTranslate('change_email', 'Change Email')}
                        labelPlacement="outside"
                        placeholder={autoTranslate('email_address', 'Email Address')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        isDisabled={updatingEmail}
                    />

                    <Button
                        type="submit"
                        color="primary"
                        size="lg"
                        isDisabled={updatingEmail || email == user?.email || email == newEmail}
                        isLoading={updatingEmail}
                        spinner={<Spinner color="current" size="sm" />}
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
            <Card className="w-full">
                <CardBody className="p-4 gap-4 items-start" as="form" onSubmit={updatePassword}>
                    {signedInRecently() ?
                        <>
                            <Input
                                size="lg"
                                variant="bordered"
                                labelPlacement="outside"
                                id="password"
                                type="password"
                                value={password}
                                label={autoTranslate('new_password', 'New Password')}
                                placeholder={autoTranslate('new_password', 'New Password')}
                                onChange={(e) => setPassword(e.target.value)}
                                isDisabled={updatingPassword}
                            />

                            <Button
                                type="submit"
                                size="lg"
                                color="primary"
                                isDisabled={updatingPassword || password.length == 0}
                                isLoading={updatingPassword}
                                spinner={<Spinner color="current" size="sm" />}
                            >
                                {updatingPassword ? (
                                    updatingText
                                ) : (
                                    <AutoTranslate tKey="update_password">
                                        Update Password
                                    </AutoTranslate>
                                )}
                            </Button>
                        </>
                        :
                        <>
                            <label>
                                <AutoTranslate tKey="change_password">
                                    Change Password
                                </AutoTranslate>
                            </label>

                            <Button color="primary" onPress={openPasswordModal} size="lg">
                                <AutoTranslate tKey="change_password">
                                    Change Password
                                </AutoTranslate>
                            </Button>

                            <Modal isOpen={passwordModalOpen} onOpenChange={passwordModalChange} placement="center" hideCloseButton>
                                <ModalContent>
                                    {(onClose) => (
                                        <>
                                            <ModalHeader className="flex flex-col gap-1">
                                                <AutoTranslate tKey="change_password">
                                                    Change Password
                                                </AutoTranslate>
                                            </ModalHeader>

                                            <ModalBody>
                                                <AutoTranslate tKey="login_again">
                                                    You must login again to change your password.
                                                </AutoTranslate>
                                            </ModalBody>

                                            <ModalFooter>
                                                <Button variant="light" onPress={onClose} size="lg">
                                                    <AutoTranslate tKey="cancel">
                                                        Cancel
                                                    </AutoTranslate>
                                                </Button>

                                                <Button color="primary" onPress={() => supabase.auth.signOut({ scope: 'local' })} size="lg">
                                                    <AutoTranslate tKey="continue">
                                                        Continue
                                                    </AutoTranslate>
                                                </Button>
                                            </ModalFooter>
                                        </>
                                    )}
                                </ModalContent>
                            </Modal>
                        </>
                    }
                </CardBody>
            </Card>

            {/* Account Management */}
            <Card className="w-full">
                <CardBody className="gap-4 flex p-4 items-start">
                    {user?.claims?.premium && (
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

                    <Button color="warning" onPress={openDeactivateModal} size="lg">
                        <AutoTranslate tKey="deactivate_account">
                            Deactivate Account
                        </AutoTranslate>
                    </Button>

                    <Modal isOpen={deactivateModalOpen} onOpenChange={deactivateModalChange} placement="center" hideCloseButton>
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">
                                        <AutoTranslate tKey="deactivate_account">
                                            Deactivate Account
                                        </AutoTranslate>
                                    </ModalHeader>

                                    <ModalBody>
                                        <AutoTranslate tKey="confirm_deactivate">
                                            Are you sure you want to deactivate your account?
                                            Your account will be reactivated if you login again.
                                        </AutoTranslate>
                                    </ModalBody>

                                    <ModalFooter>
                                        <Button variant="light" onPress={onClose} size="lg">
                                            <AutoTranslate tKey="cancel">
                                                Cancel
                                            </AutoTranslate>
                                        </Button>

                                        <Button
                                            color="warning"
                                            onPress={deactivateAccount}
                                            size="lg"
                                            isLoading={deactivating}
                                            spinner={<Spinner color="current" size="sm" />}
                                        >
                                            <AutoTranslate tKey="deactivate_account">
                                                Deactivate Account
                                            </AutoTranslate>
                                        </Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>

                    <Button color="danger" onPress={openDeleteModal} size="lg">
                        <AutoTranslate tKey="delete_account">
                            Delete Account
                        </AutoTranslate>
                    </Button>

                    <Modal isOpen={deleteModalOpen} onOpenChange={deleteModalChange} placement="center" hideCloseButton>
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">
                                        <AutoTranslate tKey="delete_account">
                                            Delete Account
                                        </AutoTranslate>
                                    </ModalHeader>

                                    <ModalBody>
                                        <AutoTranslate tKey="confirm_delete">
                                            Are you sure you want to delete your account?
                                            This deletion is permanent and cannot be undone.
                                        </AutoTranslate>
                                    </ModalBody>

                                    <ModalFooter>
                                        <Button variant="light" onPress={onClose} size="lg">
                                            <AutoTranslate tKey="cancel">
                                                Cancel
                                            </AutoTranslate>
                                        </Button>

                                        <Button
                                            color="danger"
                                            onPress={deleteAccount}
                                            size="lg"
                                            isLoading={deactivating}
                                            spinner={<Spinner color="current" size="sm" />}
                                        >
                                            <AutoTranslate tKey="delete_account">
                                                Delete Account
                                            </AutoTranslate>
                                        </Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
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