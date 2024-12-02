import { useEffect, useRef, useState } from "react"
import Compressor from "compressorjs"
import AvatarEditor from "react-avatar-editor"

import { AutoTranslate } from 'next-auto-translate'

import {
    Button,
    Slider,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalProps
} from "@nextui-org/react"

/**
 * Displays a modal to crop an image
 * 
 * @typedef {object} CropImageModalProps
 * @property {File} imageFile - The image file to crop
 * @property {(file: File) => void} setImageFile - Set the image file
 * @property {object} imageSize - The desired size of the image to crop, with width and height
 * @property {number} imageSize.width - The width of the image
 * @property {number} imageSize.height - The height of the image
 * @property {("sm"| "md" | "lg" | "xl" | "full" | "none")} [imageRadius="sm"] - The border radius of the image
 * @property {(croppedImage: File) => void} onConfirm - Callback with the cropped image file
 * @property {(error: Error) => void} onError - Callback when an error occurs
 * 
 * @param {CropImageModalProps & ModalProps} props
 * @returns {JSX.Element}
 */
export default function CropImageModal({
    imageFile,
    setImageFile,
    imageSize,
    imageRadius = "md",
    onConfirm,
    onError,
    ...props
}) {
    const [imageScale, setImageScale] = useState(1)
    const editor = useRef(null)

    const maxImageWidth = 256
    const calculatedHeight = maxImageWidth / imageSize?.width * imageSize?.height

    const calculatedRadius = {
        sm: maxImageWidth / 32,
        md: maxImageWidth / 16,
        lg: maxImageWidth / 8,
        xl: maxImageWidth / 4,
        full: maxImageWidth / 2,
        none: 0
    }[imageRadius]

    useEffect(() => setImageScale(1), [imageFile])

    const handleConfirm = async () => {
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
                    onConfirm && onConfirm(compressedFile)
                    setImageFile(null)
                },
                error(error) {
                    console.error(error)
                    onError && onError(error)
                    setImageFile(null)
                }
            })
        }, 'image/jpeg')
    }

    return (
        <Modal
            isOpen={!!imageFile}
            onOpenChange={() => setImageFile(null)}
            placement="center"
            {...props}
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