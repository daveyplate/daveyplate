import { CheckIcon } from "@heroicons/react/24/solid"
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

import Compressor from "compressorjs"
import { AutoTranslate } from 'next-auto-translate'
import { useRef, useState } from "react"
import AvatarEditor from "react-avatar-editor"
import { toast } from "./providers/toast-provider"
import { createClient } from "@/utils/supabase/component"

export default function EditAvatarModal({ user, avatarURL, setAvatarURL, bucket = "avatars", avatarSize = 512, onUpload }) {
    const [avatarScale, setAvatarScale] = useState(1)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const editor = useRef(null)
    const supabase = createClient()

    // Crop then upload the new avatar
    const cropAvatar = () => {
        setUploadingAvatar(true)

        const canvas = editor.current.getImage()

        // Convert the canvas blob to a file, then compress it
        canvas.toBlob(blob => {
            const avatarFile = new File([blob], "avatar.jpg", { type: "image/jpeg" })

            new Compressor(avatarFile, {
                // quality: 0.6,
                maxWidth: avatarSize,
                maxHeight: avatarSize,
                resize: "cover",
                mimeType: "image/jpeg",
                success(result) {
                    uploadAvatar(result)
                },
                error(error) {
                    console.error(error.message)
                    toast(error.message, { color: "danger" })
                    setUploadingAvatar(false)
                }
            })
        }, 'image/jpeg')
    }

    const uploadAvatar = async (file) => {
        const fileName = `${user.id}.jpg`

        const { error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, { upsert: true, cacheControl: 3600 })

        if (error) {
            console.error(error)
            toast(error.message, { color: "danger" })
            setUploadingAvatar(false)
            return
        }

        // Update the user Avatar URL
        const avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}` + `?${new Date().getTime()}`
        await onUpload(avatarUrl)

        setUploadingAvatar(false)
        setAvatarURL(null)
    }

    return (
        <Modal
            isOpen={!!avatarURL}
            onOpenChange={(isOpen) => !isOpen && setAvatarURL(null)}
            classNames={{ closeButton: "text-xl" }}
            scrollBehavior="outside"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            <AutoTranslate tKey="crop_image">
                                Crop Image
                            </AutoTranslate>
                        </ModalHeader>

                        <ModalBody className="items-center">
                            <AvatarEditor
                                className="rounded-xl"
                                borderRadius={256 / 2}
                                ref={editor}
                                image={avatarURL}
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
                                size="lg"
                                startContent={!uploadingAvatar &&
                                    <CheckIcon className="size-5 -ms-1" />
                                }
                                spinner={<Spinner color="current" size="sm" />}
                                isLoading={uploadingAvatar}
                            >
                                <AutoTranslate tKey="upload">
                                    Save
                                </AutoTranslate>
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}