import { useDebounce } from "@uidotdev/usehooks"
import Lightbox from "yet-another-react-lightbox"

import { XMarkIcon } from "@heroicons/react/24/solid"

export default function LightboxModal({ open, setOpen, slides }) {
    const closeOnBackdropClick = useDebounce(open, 50)

    return (
        <Lightbox
            open={open}
            close={() => setOpen(false)}
            carousel={{
                finite: slides.length <= 1,
                padding: 0,
                imageFit: 'contain'
            }}
            controller={{
                closeOnBackdropClick: closeOnBackdropClick,
                closeOnPullUp: true,
                closeOnPullDown: true
            }}
            render={{
                buttonPrev: slides.length <= 1 ? () => null : undefined,
                buttonNext: slides.length <= 1 ? () => null : undefined,
                iconClose: () => <XMarkIcon className="size-7 mx-0.5 md:my-0.5" />
            }}
            slides={slides}
        />
    )
}