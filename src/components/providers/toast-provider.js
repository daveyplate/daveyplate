import { useTheme } from "next-themes"
import { Toaster, toast as sonnerToast } from "sonner"
import { cn } from "@nextui-org/react"

// TODO add pointer-events-none to daveyplate
export default function ToastProvider() {
    const { theme } = useTheme()
    return (
        <Toaster
            position="bottom-center"
            visibleToasts={1}
            duration={3000}
            richColors={true}
            toastOptions={{
                unstyled: true,
                className: `
                    ${theme}
                    py-3 
                    px-4
                    ext-sm
                    text-center
                    rounded-full
                    w-full
                    mb-[5svh]
                    shadow-lg
                    pointer-events-none
                `,
            }}
        />
    )
}

export const toast = (message, opts = {}) => {
    const color = opts.color

    let className = 'bg-default text-default-foreground'

    if (color) {
        className = `bg-${color} text-${color}-foreground`
    }

    opts.className = cn(className, opts.className)
    delete opts.color

    sonnerToast(message, opts)
}