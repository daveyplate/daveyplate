import { useState, useEffect } from 'react'
import { useSessionContext } from '@supabase/auth-helpers-react'
import { toast } from 'sonner'

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'

import {
    Button,
    CardBody,
    CardHeader,
    Input,
    Spinner
} from "@nextui-org/react"

import {
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline'

import { createClient } from '@/utils/supabase/component'

export default function AccountSettings() {
    const supabase = createClient()
    const { autoTranslate } = useAutoTranslate()
    const { session } = useSessionContext()

    const [email, setEmail] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [nonce, setNonce] = useState('')
    const [requireNonce, setRequireNonce] = useState(false)

    const [updatingEmail, setUpdatingEmail] = useState(false)
    const [updatingPassword, setUpdatingPassword] = useState(false)

    const confirmEmail = autoTranslate('confirm_email', 'Check your email to confirm update')
    const checkEmailText = autoTranslate('check_email', 'Check your email for an authentication code')
    const passwordChanged = autoTranslate('password_changed', 'Your password has been changed')
    const changePasswordText = autoTranslate('change_password', 'Change Password')
    const authenticationCodeText = autoTranslate('authentication_code', 'Authentication Code')

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
            toast.error(error.message)
            return
        }

        setNewEmail(email)
        toast.success(confirmEmail)
    }

    const updatePassword = async (e) => {
        e.preventDefault()

        setUpdatingPassword(true)

        const params = { password }

        if (requireNonce) {
            params.nonce = nonce
        }

        const { error } = await supabase.auth.updateUser(params)

        if (error?.message?.includes('reauthentication')) {
            const { error } = await supabase.auth.reauthenticate()
            setUpdatingPassword(false)

            if (error) return toast.error(error.message)

            setRequireNonce(true)

            return toast.info(checkEmailText)
        }

        setNonce('')
        setRequireNonce(false)
        setUpdatingPassword(false)

        if (error) return toast.error(error.message)

        setPassword('')
        toast.success(passwordChanged)

        supabase.auth.signOut({ scope: 'others' })
    }

    return (
        <>
            <CardHeader className="px-4 pb-1">
                <p className="text-large">
                    <AutoTranslate tKey="account_settings">
                        Account Settings
                    </AutoTranslate>
                </p>
            </CardHeader>

            <CardBody className="gap-4 pb-2" as="form" onSubmit={updateEmail}>
                <Input
                    type="email"
                    label={
                        <AutoTranslate tKey="email_address">
                            Email Address
                        </AutoTranslate>
                    }
                    labelPlacement="outside"
                    placeholder={autoTranslate('email_address', 'Email Address')}
                    value={email}
                    onValueChange={setEmail}
                    isDisabled={updatingEmail}
                />

                <Button
                    className="self-start"
                    type="submit"
                    color="primary"
                    isDisabled={
                        updatingEmail ||
                        email == session?.user?.email ||
                        email == newEmail
                    }
                    isLoading={updatingEmail}
                    spinner={
                        <Spinner color="current" size="sm" />
                    }
                >
                    <AutoTranslate tKey="update_email">
                        Update Email
                    </AutoTranslate>
                </Button>
            </CardBody>

            <CardBody className="gap-4" as="form" onSubmit={updatePassword}>
                <input type="hidden" name="email" value={session?.user?.email} />

                <Input
                    labelPlacement="outside"
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    value={password}
                    onValueChange={setPassword}
                    label={changePasswordText}
                    placeholder={autoTranslate('new_password', 'New Password')}
                    isDisabled={!session || updatingPassword}
                    endContent={
                        <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onPress={() => setPasswordVisible(!passwordVisible)}
                            disableRipple
                            className="!bg-transparent"
                        >
                            {passwordVisible ? (
                                <EyeSlashIcon className="size-5 text-default-400" />
                            ) : (
                                <EyeIcon className="size-5 text-default-400" />
                            )}
                        </Button>
                    }
                />

                {requireNonce && (
                    <Input
                        autoFocus
                        labelPlacement="outside"
                        type="text"
                        value={nonce}
                        onValueChange={setNonce}
                        label={authenticationCodeText}
                        placeholder={authenticationCodeText}
                        isDisabled={updatingPassword}
                    />
                )}

                <Button
                    className="self-start"
                    type="submit"
                    color="primary"
                    isDisabled={
                        updatingPassword ||
                        password.length == 0 ||
                        (requireNonce && nonce.length == 0)
                    }
                    isLoading={updatingPassword}
                    spinner={
                        <Spinner color="current" size="sm" />
                    }
                >
                    <AutoTranslate tKey="update_password">
                        Update Password
                    </AutoTranslate>
                </Button>
            </CardBody>
        </>
    )
}