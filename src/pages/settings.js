import { useState, useEffect } from 'react'
import { useSessionContext } from '@supabase/auth-helpers-react'
import { toast } from 'sonner'

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'
import { useEntity } from '@daveyplate/supabase-swr-entities/client'
import { ConfirmModal } from "@daveyplate/nextui-confirm-modal"

import {
    Button,
    Card,
    CardBody,
    CardHeader,
    cn,
    Input,
    Spinner,
    Switch,
    Tab,
    Tabs,
} from "@nextui-org/react"

import {
    BellIcon,
    ChevronDownIcon,
    Cog6ToothIcon,
    ComputerDesktopIcon,
    EyeIcon,
    EyeSlashIcon,
    MoonIcon,
    SunIcon
} from '@heroicons/react/24/outline'

import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { Link, useLocaleRouter } from '@/i18n/routing'
import { createClient } from '@/utils/supabase/component'
import { isExport } from "@/utils/utils"

import { ThemeDropdown } from '@/components/theme-dropdown'
import { useIsClient } from '@uidotdev/usehooks'
import { useTheme } from 'next-themes'
import { LocaleDropdown, localeToCountry } from '@/components/locale-dropdown'
import { useLocale } from 'next-intl'
import Flag from 'react-flagpack'

export default function Settings() {
    const localeRouter = useLocaleRouter()
    const locale = useLocale()
    const supabase = createClient()
    const isClient = useIsClient()
    const { theme: currentTheme } = useTheme()
    const { autoTranslate } = useAutoTranslate()
    const { session, isLoading: sessionLoading } = useSessionContext()

    const { updateEntity: updateUser, deleteEntity: deleteUser } = useEntity(session ? 'profiles' : null, 'me', null, { revalidateOnFocus: false })
    const { entity: metadata, updateEntity: updateMetadata } = useEntity(session ? 'metadata' : null, 'me', null, { revalidateOnFocus: false })
    const [confirm, setConfirm] = useState(null)

    const [email, setEmail] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordVisible, setPasswordVisible] = useState(false)

    const [nonce, setNonce] = useState('')
    const [requireNonce, setRequireNonce] = useState(false)

    const [updatingEmail, setUpdatingEmail] = useState(false)
    const [updatingPassword, setUpdatingPassword] = useState(false)

    const confirmEmail = autoTranslate('confirm_email', 'Check your email to confirm update')
    const deactivateText = autoTranslate('deactivate', 'Deactivate')
    const deactivateAccountText = autoTranslate('deactivate_account', 'Deactivate Account')
    const deactivateConfirm = autoTranslate('deactivate_confirm', 'Are you sure you want to deactivate your account? Your account will be reactivated when you login again.')
    const deleteText = autoTranslate('delete', 'Delete')
    const deleteAccountText = autoTranslate('delete_account', 'Delete Account')
    const deleteConfirm = autoTranslate('delete_confirm', 'Are you sure you want to delete your account? This deletion is permanent and cannot be undone.')
    const changePasswordText = autoTranslate('change_password', 'Change Password')
    const passwordChanged = autoTranslate('password_changed', 'Your password has been changed')
    const accountDeactivated = autoTranslate('account_deactivated', 'Account deactivated')
    const accountDeleted = autoTranslate('account_deleted', 'Account deleted')
    const authenticationCodeText = autoTranslate('authentication_code', 'Authentication Code')
    const checkEmailText = autoTranslate('check_email', 'Check your email for an authentication code')

    const themes = [
        {
            key: 'light',
            title: autoTranslate("light", "Light"),
            icon: SunIcon
        },
        {
            key: 'dark',
            title: autoTranslate("dark", "Dark"),
            icon: MoonIcon
        },
        {
            key: 'system',
            title: autoTranslate("system", "System"),
            icon: ComputerDesktopIcon
        },
    ]

    const selectedTheme = themes.find(theme => theme.key === currentTheme)

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

            if (error) return toast.error(error.message)

            setRequireNonce(true)

            return toast.info(checkEmailText)
        }

        // Clear the nonce and requireNonce state
        setNonce('')
        setRequireNonce(false)
        setUpdatingPassword(false)

        if (error) return toast.error(error.message)

        setPassword('')
        toast.success(passwordChanged)

        // Sign out other devices
        supabase.auth.signOut({ scope: 'others' })
    }

    const deactivateAccount = async () => {
        const { error } = await updateUser({ deactivated: true })
        if (error) return

        toast.warning(accountDeactivated)
        supabase.auth.signOut({ scope: 'others' })
        localeRouter.replace('/logout')
    }

    const deleteAccount = async () => {
        const { error } = await deleteUser()
        if (error) return

        toast.error(accountDeleted)
        localeRouter.replace('/logout')
    }

    return (
        <div
            className={cn(sessionLoading ? "opacity-0" : "opacity-1",
                "flex flex-col grow gap-4 p-4 items-center"
            )}
        >
            <Card fullWidth className="max-w-xl px-1 pt-2">
                <Tabs className="p-3" classNames={{ tabContent: "text-small", base: cn(!session && "hidden") }} size="lg">
                    <Tab
                        textValue="Settings"
                        title={
                            <div className="flex items-center gap-1.5">
                                <Cog6ToothIcon className="size-5" />

                                <p>
                                    <AutoTranslate tKey="settings">
                                        Settings
                                    </AutoTranslate>
                                </p>
                            </div>
                        }
                    >
                        <CardHeader className="px-4 py-0">
                            <p className="text-large">
                                <AutoTranslate tKey="application_settings">
                                    Application Settings
                                </AutoTranslate>
                            </p>
                        </CardHeader>

                        <CardBody className="gap-3 items-start">
                            <div className="bg-content2 p-4 rounded-medium flex justify-between items-center w-full">
                                <p>
                                    <AutoTranslate tKey="theme">
                                        Theme
                                    </AutoTranslate>
                                </p>

                                <ThemeDropdown>
                                    <Button
                                        variant="bordered"
                                        startContent={isClient && (
                                            <selectedTheme.icon className="size-5" />
                                        )}
                                        endContent={
                                            <ChevronDownIcon className="size-4 mt-0.5 -me-0.5" />
                                        }
                                    >
                                        {selectedTheme?.title}
                                    </Button>
                                </ThemeDropdown>
                            </div>

                            <div className="bg-content2 p-4 rounded-medium flex justify-between items-center w-full">
                                <p>
                                    <AutoTranslate tKey="language">
                                        Language
                                    </AutoTranslate>
                                </p>

                                <LocaleDropdown>
                                    <Button
                                        variant="bordered"
                                        startContent={
                                            <Flag
                                                code={localeToCountry[locale]}
                                                gradient="real-linear"
                                                hasDropShadow
                                                size="m"
                                            />
                                        }
                                        endContent={
                                            <ChevronDownIcon className="size-4 mt-0.5 -me-0.5" />
                                        }
                                    >
                                        {new Intl.DisplayNames([locale], { type: 'language' }).of(locale)}
                                    </Button>
                                </LocaleDropdown>
                            </div>
                        </CardBody>

                        {session && (
                            <>
                                <CardHeader className="px-4 pb-1">
                                    <p className="text-large">
                                        <AutoTranslate tKey="account_settings">
                                            Account Settings
                                        </AutoTranslate>
                                    </p>
                                </CardHeader>

                                <CardBody className="gap-4 items-start pb-2" as="form" onSubmit={updateEmail}>
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

                                <CardBody className="gap-4 items-start" as="form" onSubmit={updatePassword}>
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

                                <CardHeader className="px-4 pb-0">
                                    <p className="text-large">
                                        <AutoTranslate tKey="manage_account">
                                            Manage Account
                                        </AutoTranslate>
                                    </p>
                                </CardHeader>

                                <CardBody className="gap-3 items-start">
                                    <div className="bg-content2 p-4 rounded-medium flex justify-between items-center w-full">
                                        <p>
                                            <AutoTranslate tKey="logout">
                                                Log Out
                                            </AutoTranslate>
                                        </p>

                                        <Button
                                            variant="bordered"
                                            as={Link}
                                            href="/logout"
                                        >
                                            <AutoTranslate tKey="logout">
                                                Log Out
                                            </AutoTranslate>
                                        </Button>
                                    </div>

                                    <div className="bg-content2 p-4 rounded-medium flex justify-between items-center w-full">
                                        <p>
                                            <AutoTranslate tKey="deactivate_account">
                                                Deactivate Account
                                            </AutoTranslate>
                                        </p>

                                        <Button
                                            color="warning"
                                            variant="flat"
                                            onPress={() => {
                                                setConfirm({
                                                    title: deactivateAccountText,
                                                    content: deactivateConfirm,
                                                    label: deactivateText,
                                                    action: deactivateAccount,
                                                    color: 'warning'
                                                })
                                            }}
                                        >
                                            <AutoTranslate tKey="deactivate">
                                                Deactivate
                                            </AutoTranslate>
                                        </Button>
                                    </div>

                                    <div className="bg-content2 p-4 rounded-medium flex justify-between items-center w-full">
                                        <p className="text-base">
                                            <AutoTranslate tKey="delete_account">
                                                Delete Account
                                            </AutoTranslate>
                                        </p>

                                        <Button
                                            color="danger"
                                            variant="flat"
                                            onPress={() => {
                                                setConfirm({
                                                    title: deleteAccountText,
                                                    content: deleteConfirm,
                                                    label: deleteText,
                                                    action: deleteAccount,
                                                    color: 'danger'
                                                })
                                            }}
                                        >
                                            <AutoTranslate tKey="delete">
                                                Delete
                                            </AutoTranslate>
                                        </Button>
                                    </div>
                                </CardBody>
                            </>
                        )}
                    </Tab>

                    <Tab
                        className={cn(!session && "hidden")}
                        textValue="Notifications"
                        title={
                            <div className="flex items-center gap-1.5">
                                <BellIcon className="size-5" />

                                <p>
                                    <AutoTranslate tKey="notifications">
                                        Notifications
                                    </AutoTranslate>
                                </p>
                            </div>
                        }
                    >
                        <CardHeader className="px-4 py-0">
                            <p className="text-large">
                                <AutoTranslate tKey="notification_settings">
                                    Notification Settings
                                </AutoTranslate>
                            </p>
                        </CardHeader>

                        <CardBody className="gap-3">
                            <Switch
                                isSelected={!metadata?.notifications_enabled}
                                onValueChange={(value) => updateMetadata({ notifications_enabled: !value })}
                                classNames={{
                                    base: "flex-row-reverse justify-between w-full max-w-full"
                                }}
                                className="bg-content2 p-4 rounded-medium"
                                isDisabled={!metadata}
                            >
                                <AutoTranslate tKey="pause_all">
                                    Pause all
                                </AutoTranslate>
                            </Switch>

                            <Switch
                                isSelected={!!metadata?.notifications_badge_enabled}
                                onValueChange={(value) => updateMetadata({ notifications_badge_enabled: value })}
                                classNames={{
                                    base: "flex-row-reverse justify-between w-full max-w-full"
                                }}
                                className="bg-content2 p-4 rounded-medium"
                                isDisabled={!metadata}
                            >
                                <AutoTranslate tKey="show_badge">
                                    Show Badge
                                </AutoTranslate>
                            </Switch>

                            <Switch
                                isSelected={!!metadata?.show_badge_count}
                                onValueChange={(value) => updateMetadata({ show_badge_count: value })}
                                classNames={{
                                    base: "flex-row-reverse justify-between w-full max-w-full"
                                }}
                                className="bg-content2 p-4 rounded-medium"
                                isDisabled={!metadata}
                            >
                                <AutoTranslate tKey="badge_count">
                                    Badge Count
                                </AutoTranslate>
                            </Switch>

                        </CardBody>

                        <CardHeader className="px-4 pb-0">
                            <p className="text-large">
                                <AutoTranslate tKey="notification_types">
                                    Notification Types
                                </AutoTranslate>
                            </p>
                        </CardHeader>

                        <CardBody className="gap-3">
                            <Switch
                                isSelected={!!metadata?.notifications_whispers}
                                onValueChange={(value) => updateMetadata({ notifications_whispers: value })}
                                classNames={{
                                    base: "flex-row-reverse justify-between w-full max-w-full"
                                }}
                                className="bg-content2 p-4 rounded-medium"
                                isDisabled={!metadata}
                            >
                                <AutoTranslate tKey="whispers">
                                    Whispers
                                </AutoTranslate>
                            </Switch>

                            <Switch
                                isSelected={!!metadata?.notifications_article_comments}
                                onValueChange={(value) => updateMetadata({ notifications_article_comments: value })}
                                classNames={{
                                    base: "flex-row-reverse justify-between w-full max-w-full"
                                }}
                                className="bg-content2 p-4 rounded-medium"
                                isDisabled={!metadata}
                            >
                                <AutoTranslate tKey="article_comments">
                                    Article Comments
                                </AutoTranslate>
                            </Switch>
                        </CardBody>
                    </Tab>
                </Tabs>
            </Card>

            <ConfirmModal confirm={confirm} setConfirm={setConfirm} />
        </div>
    )
}

export async function getStaticProps({ locale, params }) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined