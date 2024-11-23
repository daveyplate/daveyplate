import Image from "next/image";

export default function BrandIcon({ className, brand, ...props }) {
    return (
        <Image src={`/brands/${brand}.svg`} height={32} width={32} className={className} {...props} />
    )
}