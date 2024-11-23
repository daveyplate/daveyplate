import { useRef, useState } from "react"
import Compressor from "compressorjs"
import { useSession } from "@supabase/auth-helpers-react"
import AvatarEditor from "react-avatar-editor"

import { AutoTranslate } from 'next-auto-translate'

import {
  Button,
  Slider,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react"

import { CloudArrowUpIcon } from "@heroicons/react/24/solid"

import { createClient } from "@/utils/supabase/component"

/**
 * Upload Avatar Modal
 * 
 * @param {Object} props
 * @param {File} props.avatarFile - The avatar file to upload
 * @param {(file: File) => void} props.setAvatarFile - Set the avatar file
 * @param {string} [props.bucket="avatars"] - The bucket to upload the avatar to
 * @param {number} [props.avatarSize=512] - The size of the avatar to upload
 * @param {(url: string) => void} props.onUpload - Callback when the avatar is uploaded
 * @param {(error: Error) => void} props.onError - Callback when an error occurs
 * @returns {JSX.Element}
 */
export default function UploadAvatarModal({
  avatarFile,
  setAvatarFile,
  bucket = "avatars",
  avatarSize = 512,
  onUpload,
  onError
}) {
  const supabase = createClient()
  const session = useSession()
  const [avatarScale, setAvatarScale] = useState(1)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const editor = useRef(null)

  // Crop then upload the new avatar
  const cropAvatar = () => {
    setUploadingAvatar(true)

    const canvas = editor.current.getImage()

    // Convert the canvas blob to a file, then compress it
    canvas.toBlob(blob => {
      const avatarFile = new File([blob], "avatar.jpg", { type: "image/jpeg" })

      new Compressor(avatarFile, {
        maxWidth: avatarSize,
        maxHeight: avatarSize,
        resize: "cover",
        mimeType: "image/jpeg",
        success(result) {
          uploadAvatar(result)
        },
        error(error) {
          console.error(error)
          onError && onError(error)
          setAvatarFile(null)
          setUploadingAvatar(false)
          setAvatarScale(1)
        }
      })
    }, 'image/jpeg')
  }

  const uploadAvatar = async (file) => {
    const fileName = `${session.user.id}.jpg`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true, cacheControl: 3600 })

    setUploadingAvatar(false)
    setAvatarScale(1)
    setAvatarFile(null)

    if (error) {
      console.error(error)
      onError && onError(error)
      return
    }

    // Update the user Avatar URL
    const avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}` + `?${new Date().getTime()}`
    onUpload && onUpload(avatarUrl)
  }

  return (
    <Modal
      isOpen={!!avatarFile}
      onOpenChange={() => {
        setAvatarFile(null)
        setAvatarScale(1)
      }}
      classNames={{ closeButton: "text-xl" }}
      placement="center"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <AutoTranslate tKey="upload_avatar">
                Upload Avatar
              </AutoTranslate>
            </ModalHeader>

            <ModalBody className="items-center">
              <AvatarEditor
                className="rounded-xl"
                borderRadius={256 / 2}
                ref={editor}
                image={avatarFile}
                width={256}
                height={256}
                scale={avatarScale}
              />

              <Slider
                size="lg"
                color="foreground"
                aria-label="Avatar Scale"
                className="w-[304px]"
                value={avatarScale}
                maxValue={3}
                minValue={1}
                step={0.01}
                onChange={(value) => setAvatarScale(value)}
                isDisabled={uploadingAvatar}
              />
            </ModalBody>

            <ModalFooter>
              <Button variant="light" onPress={onClose} size="lg">
                <AutoTranslate tKey="cancel">
                  Cancel
                </AutoTranslate>
              </Button>

              <Button
                onPress={cropAvatar}
                color="primary"
                size="lg"
                startContent={!uploadingAvatar &&
                  <CloudArrowUpIcon className="size-5 -ms-1" />
                }
                spinner={<Spinner color="current" size="sm" />}
                isLoading={uploadingAvatar}
              >
                <AutoTranslate tKey="upload">
                  Upload
                </AutoTranslate>
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}