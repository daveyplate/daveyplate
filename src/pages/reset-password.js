import { useState } from 'react'

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'


import { Button, Card, CardBody, Input, Spinner } from "@nextui-org/react"
import { CheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'
import { toast } from 'sonner'

import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { useLocaleRouter } from '@/i18n/routing'
import { createClient } from '@/utils/supabase/component'
import { isExport } from "@/utils/utils"

import useAuthenticatedPage from '@/hooks/useAuthenticatedPage'

export default function ResetPassword() {
  useAuthenticatedPage()

  const localeRouter = useLocaleRouter()
  const supabase = createClient()
  const { autoTranslate } = useAutoTranslate()

  const [password, setPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)

  const passwordChanged = autoTranslate('password_changed', 'Your password has been changed')
  const passwordError = autoTranslate('password_error', 'Error updating password')

  const updatePassword = async (e) => {
    e.preventDefault()

    setUpdatingPassword(true)

    const { error } = await supabase.auth.updateUser({ password })

    setPassword('')
    setUpdatingPassword(false)

    if (error) {
      toast.error(passwordError)
    } else {
      toast.success(passwordChanged)

      localeRouter.replace("/")

      // Sign out other devices
      supabase.auth.signOut({ scope: 'others' })
    }
  }

  return (
    <div className="flex-center max-w-sm">
      <h3 className="hidden sm:block">
        <AutoTranslate tKey="title">
          Reset Password
        </AutoTranslate>
      </h3>

      <Card fullWidth>
        <CardBody as="form" onSubmit={updatePassword} className="p-4 gap-4 items-start">
          <Input
            type={passwordVisible ? "text" : "password"}
            variant="bordered"
            size="lg"
            value={password}
            placeholder={autoTranslate("password", "Password")}
            label={autoTranslate("new_password", "New Password")}
            labelPlacement="outside"
            onValueChange={setPassword}
            disabled={updatingPassword}
            endContent={
              <Button
                size="sm"
                variant="light"
                isIconOnly
                onPress={() => setPasswordVisible(!passwordVisible)}
                disableRipple
              >
                {passwordVisible ? (
                  <EyeSlashIcon className="size-6" />
                ) : (
                  <EyeIcon className="size-6" />
                )}
              </Button>
            }
          />

          <Button
            type="submit"
            size="lg"
            isDisabled={updatingPassword || !password}
            isLoading={updatingPassword}
            spinner={<Spinner color="current" size="sm" />}
            startContent={!updatingPassword && <CheckIcon className="size-5 -ms-1" />}
            color="primary"
          >
            <AutoTranslate tKey="save_password">
              Save Password
            </AutoTranslate>
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}

export async function getStaticProps({ locale, params }) {
  const translationProps = await getTranslationProps({ locale, params })

  return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined