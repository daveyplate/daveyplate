import { Spinner } from "@nextui-org/react"
import { useTheme } from "next-themes"
import { Toaster } from "sonner"

export default function ToastProvider() {
    const { theme } = useTheme()

    return (
        <Toaster
            theme={theme}
            richColors={true}
            icons={{
                loading: <Spinner size="sm" color="current" className="me-1 mt-1" />,
            }}
            toastOptions={{
                classNames: {
                    title: "!text-small",
                    error: "!bg-danger-50 !border-danger-100 !text-danger-700",
                    success: "!bg-success-50 !border-success-100 !text-success-700",
                    warning: "!bg-warning-50 !border-warning-100 !text-warning-700",
                    info: "!bg-primary-50 !border-primary-100 !text-primary-700"
                },
                className: "justify-center rounded-large !my-safe"
            }}
            position="bottom-center"
        />
    )
}