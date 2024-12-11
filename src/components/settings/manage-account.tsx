import { useState } from 'react'
import { useSessionContext } from '@supabase/auth-helpers-react'
import { toast } from 'sonner'

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'
import { useEntity } from '@daveyplate/supabase-swr-entities/client'

import { Button, CardBody, CardHeader } from "@nextui-org/react"
import { Confirm, ConfirmModal } from '@daveyplate/nextui-confirm-modal'

import { createClient } from '@/utils/supabase/component'
import { Link, useLocaleRouter } from '@/i18n/routing'
import CellWrapper from '@/components/settings/cell-wrapper'

export default function ManageAccount() {
    const supabase = createClient()
    const localeRouter = useLocaleRouter()
    const { session } = useSessionContext()
    const { autoTranslate } = useAutoTranslate()
    const { updateEntity: updateUser, deleteEntity: deleteUser } = useEntity(session && 'profiles', 'me', null, { revalidateOnFocus: false })
    const [confirm, setConfirm] = useState<Confirm | null>(null)

    const deactivateText = autoTranslate('deactivate', 'Deactivate')
    const deactivateAccountText = autoTranslate('deactivate_account', 'Deactivate Account')
    const deactivateConfirm = autoTranslate('deactivate_confirm', 'Are you sure you want to deactivate your account? Your account will be reactivated when you login again.')
    const deleteText = autoTranslate('delete', 'Delete')
    const deleteAccountText = autoTranslate('delete_account', 'Delete Account')
    const deleteConfirm = autoTranslate('delete_confirm', 'Are you sure you want to delete your account? This deletion is permanent and cannot be undone.')
    const accountDeactivated = autoTranslate('account_deactivated', 'Account deactivated')
    const accountDeleted = autoTranslate('account_deleted', 'Account deleted')

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
        <>
            <CardHeader className="px-4 pb-0">
                <p className="text-large">
                    <AutoTranslate tKey="manage_account">
                        Manage Account
                    </AutoTranslate>
                </p>
            </CardHeader>

            <CardBody className="gap-3">
                <CellWrapper>
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
                </CellWrapper>

                <CellWrapper>
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
                </CellWrapper>

                <CellWrapper>
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
                </CellWrapper>
            </CardBody>

            <ConfirmModal confirm={confirm} setConfirm={setConfirm} />
        </>
    )
}