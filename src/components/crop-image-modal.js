import { useEffect, useRef, useState } from "react"
import Compressor from "compressorjs"
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

/**
 * Displays a modal to crop an image
 * 
 * @param {Object} props
 * @param {File} props.imageFile - The image file to crop
 * @param {(file: File) => void} props.setImageFile - Set the image file
 * @param {Object} props.imageSize - The desired size of the image to crop, with width and height
 * @param {number} props.imageSize.width - The width of the image
 * @param {number} props.imageSize.height - The height of the image
 * @param {("sm"| "md" | "lg" | "xl" | "full")} [props.radius="sm"] - The border radius of the image
 * @param {(file: File) => Promise<boolean>} props.onConfirm - Asynchronous callback when the image is confirmed, returns true if successful
 * @param {(error: Error) => void} props.onError - Callback when an error occurs
 * @returns {JSX.Element}
 */
export default function CropImageModal({
    imageFile,
    setImageFile,
    imageSize,
    onConfirm,
    radius = "md",
    onError
}) {
    const [imageScale, setImageScale] = useState(1)
    const [processing, setProcessing] = useState(false)
    const editor = useRef(null)

    const maxImageWidth = 256
    const calculatedHeight = maxImageWidth / imageSize?.width * imageSize?.height

    const calculatedRadius = {
        sm: maxImageWidth / 32,
        md: maxImageWidth / 16,
        lg: maxImageWidth / 8,
        xl: maxImageWidth / 4,
        full: maxImageWidth / 2
    }[radius]

    useEffect(() => setImageScale(1), [imageFile])

    const handleConfirm = async () => {
        setProcessing(true)

        const canvas = editor.current.getImage()

        // Convert the canvas blob to a file, then compress it
        canvas.toBlob(blob => {
            const blobFile = new File([blob], "blob.jpg", { type: "image/jpeg" })

            new Compressor(blobFile, {
                maxWidth: imageSize.width,
                maxHeight: imageSize.height,
                resize: "cover",
                mimeType: "image/jpeg",
                success: async (compressedFile) => {
                    const successful = await onConfirm(compressedFile)
                    if (successful) setImageFile(null)

                    setProcessing(false)
                },
                error(error) {
                    console.error(error)
                    onError && onError(error)
                    setImageFile(null)
                    setProcessing(false)
                }
            })
        }, 'image/jpeg')
    }

    return (
        <Modal
            isOpen={!!imageFile}
            onOpenChange={() => setImageFile(null)}
            placement="center"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            <AutoTranslate tKey="crop_image">
                                Crop Image
                            </AutoTranslate>
                        </ModalHeader>

                        <ModalBody className="items-center gap-4">
                            <AvatarEditor
                                className="rounded-xl"
                                borderRadius={calculatedRadius}
                                ref={editor}
                                image={imageFile}
                                width={maxImageWidth}
                                height={calculatedHeight}
                                scale={imageScale}
                            />

                            <Slider
                                color="foreground"
                                aria-label="Image Scale"
                                className="w-[306px]"
                                value={imageScale}
                                maxValue={3}
                                minValue={1}
                                step={0.01}
                                onChange={(value) => setImageScale(value)}
                                isDisabled={processing}
                            />
                        </ModalBody>

                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                <AutoTranslate tKey="cancel">
                                    Cancel
                                </AutoTranslate>
                            </Button>

                            <Button
                                onPress={handleConfirm}
                                color="primary"
                                spinner={<Spinner color="current" size="sm" />}
                                isLoading={processing}
                            >
                                <AutoTranslate tKey="confirm">
                                    Confirm
                                </AutoTranslate>
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}