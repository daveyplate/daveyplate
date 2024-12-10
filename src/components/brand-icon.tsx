import Image, { ImageProps } from "next/image"

interface BrandIconProps extends ImageProps {
    className?: string
    brand: string
}

export default function BrandIcon({ className, brand, ...props }: BrandIconProps) {
    return (
        <Image
            height={32}
            width={32}
            className={className}
            {...props}
            src={`/brands/${brand}.svg`}
            alt={brand}
        />
    )
}