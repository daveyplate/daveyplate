import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import { useLocale } from "next-intl"
import { useSession } from "@supabase/auth-helpers-react"

import { AutoTranslate, useAutoTranslate } from 'next-auto-translate'
import { getLocaleValue, isExport, useEntity } from "@daveyplate/supabase-swr-entities/client"
import { PageTitle } from "@daveyplate/next-page-title"
import { OpenGraph } from "@daveyplate/next-open-graph"
import { DragDropzone } from "@daveyplate/tailwind-drag-dropzone"

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  cn,
  Skeleton
} from "@nextui-org/react"
import { PencilIcon } from "@heroicons/react/24/solid"
import { toast } from "sonner"

import { createClient } from "@/utils/supabase/component"
import { getTranslationProps } from "@/i18n/translation-props"
import { getLocalePaths } from "@/i18n/locale-paths"
import { Link } from "@/i18n/routing"

import UserAvatar from "@/components/user-avatar"
import UploadAvatarModal from "@/components/upload-avatar-modal"
import LightboxModal from "@/components/lightbox-modal"
import OptionsDropdown from "@/components/options-dropdown"

export default function UserPage({ user_id, user: fallbackData }) {
  const supabase = createClient()
  const locale = useLocale()
  const router = useRouter()
  const { autoTranslate } = useAutoTranslate()
  const session = useSession()

  const userId = user_id || router.query.user_id
  const { entity: user, isLoading: userLoading } = useEntity(userId && 'profiles', userId, { lang: locale }, { fallbackData })
  const { updateEntity: updateUser } = useEntity(session ? 'profiles' : null, 'me')
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const [avatarFile, setAvatarFile] = useState(null)
  const uploadRef = useRef(null)

  const isMe = session && userId == session.user.id
  const localizedBio = getLocaleValue(user?.bio, locale, user?.locale)


  useEffect(() => {
    if (userId && !userLoading && !user) {
      router.replace('/404')
    }
  }, [userId, user, userLoading])

  return (
    <div className="flex-center max-w-lg">
      <PageTitle title={user?.full_name} />

      <OpenGraph
        title={user?.full_name || "Profile"}
        description={localizedBio || `User Profile: ${user?.full_name}`}
        image={user?.avatar_url}
        ogType="profile"
      />

      <Card fullWidth>
        <CardHeader
          className="flex h-24 flex-col justify-end bg-gradient-to-br from-indigo-300 via-blue-300 to-primary-400 z-0"
        >
          <OptionsDropdown
            className={cn(!isMe ? "opacity-100" : "opacity-0",
              "absolute right-3 top-3 transition-all text-white bg-background/20"
            )}
            variant="light"
            isDisabled={isMe}
          />

          <Button
            as={Link}
            href="/edit-profile"
            className={cn(isMe ? "opacity-100 " : "opacity-0",
              "absolute right-3 top-3 bg-background/20"
            )}
            radius="full"
            variant="light"
            startContent={<PencilIcon className="size-3.5" />}
            isDisabled={!isMe}
          >
            <AutoTranslate tKey="edit_profile">
              Edit Profile
            </AutoTranslate>
          </Button>
        </CardHeader>

        <CardBody className="px-4 pt-9 overflow-visible">
          <DragDropzone
            size="lg"
            label={autoTranslate("upload_avatar", "Upload Avatar")}
            openRef={uploadRef}
            onFiles={(files) => setAvatarFile(files[0])}
            onError={(error) => toast.error(error.message)}
            className="flex flex-col"
          >
            <Skeleton isLoaded={!!user} className="rounded-full -mt-20 -mb-1 mx-auto z-10">
              <Badge
                as={Button}
                isOneChar
                content={
                  <PencilIcon className="size-2.5" />
                }
                placement="bottom-right"
                shape="circle"
                variant="faded"
                size="lg"
                className="bg-background"
                isInvisible={!isMe}
                onPress={() => uploadRef.current()}
              >
                <UserAvatar
                  as={Button}
                  isIconOnly
                  className="h-20 w-20"
                  size="lg"
                  user={user}
                  onPress={() => setLightboxOpen(true)}
                />
              </Badge>
            </Skeleton>

            <h5>
              <Skeleton isLoaded={!!user} className="rounded-full size-fit h-6 my-0.5 min-w-32">
                {user && (user?.full_name || "Unnamed")}
              </Skeleton>
            </h5>

            <Skeleton isLoaded={!!user} className="rounded-full size-fit h-6 my-0.5">
              <p className="text-default-400">
                <AutoTranslate tKey="subscription">
                  Subscription:
                </AutoTranslate>

                <span className={cn('ml-1.5', user?.claims?.premium ? "text-success" : "text-foreground")}>
                  {user?.claims?.premium ?
                    <AutoTranslate tKey="active">
                      Active
                    </AutoTranslate>
                    :
                    <AutoTranslate tKey="inactive">
                      Inactive
                    </AutoTranslate>
                  }
                </span>
              </p>
            </Skeleton>


            <div className="flex gap-2 pb-1 pt-2 hidden">
              <Chip variant="flat" size="lg"></Chip>
            </div>

            <Skeleton
              isLoaded={!!user}
              className={cn("rounded-full size-fit my-0.5 min-w-64", (!user || localizedBio) && "min-h-6 mt-2.5")}
            >
              {localizedBio && (
                <p>
                  {localizedBio}
                </p>
              )}
            </Skeleton>
          </DragDropzone>
        </CardBody>
      </Card>

      <LightboxModal
        open={lightboxOpen && user?.avatar_url}
        setOpen={setLightboxOpen}
        slides={[{ src: user?.avatar_url }]}
      />

      <UploadAvatarModal
        avatarFile={avatarFile}
        setAvatarFile={setAvatarFile}
        onUpload={async (url) => {
          supabase.auth.updateUser({ data: { avatar_url: url } })
          updateUser({ avatar_url: url })
        }}
        onError={(error) => toast.error(error.message)}
      />
    </div>
  )
}

export async function getStaticProps({ locale, params }) {
  const translationProps = await getTranslationProps({ locale, params })

  return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined