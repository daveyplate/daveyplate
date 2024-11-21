import { Toaster, toast as sonnerToast } from "sonner"
import { cn } from "@nextui-org/react"

export default function ToastProvider() {
    return (
        <Toaster
            visibleToasts={1}
            duration={3000}
        />
    )
}

/**
 * Show a toast message
 * @param {string} message The message to display
 * @param {object} opts Options for the toast
 * @param {string} [opts.color="default"] The color of the toast
 * @param {string} [opts.className] The color of the toast
 */
export const toast = (message, { color = "default", className = null } = {}) => {
    className = cn(`
        py-3 
        px-4
        ext-sm
        text-center
        rounded-full
        w-full
        mb-[5svh]
        shadow-lg
        pointer-events-none
        bg-${color} 
        text-${color}-foreground
        `, className)
    sonnerToast(message, { className, unstyled: true, position: "bottom-center", dismissible: false })
}