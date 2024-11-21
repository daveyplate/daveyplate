import { useTheme } from "next-themes"

import { Toaster } from "sonner"
import { Spinner } from "@nextui-org/react"
import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon
} from "@heroicons/react/24/outline"

export default function ToastProvider() {
    const { theme } = useTheme()

    return (
        <Toaster
            theme={theme}
            visibleToasts={1}
            richColors={true}
            icons={{
                success: <CheckCircleIcon className="size-5 mb-[1px]" />,
                info: <InformationCircleIcon className="size-5 mb-[1px]" />,
                warning: <ExclamationTriangleIcon className="size-5 mb-[1px]" />,
                error: <ExclamationCircleIcon className="size-5 mb-[1px]" />,
                loading: <Spinner size="sm" color="current" className="me-1 mt-1" />,
            }}
            toastOptions={{
                classNames: {
                    error: "!bg-danger-50 !text-danger-700",
                    success: "!bg-success-50 !text-success-700",
                    warning: "!bg-warning-50 !text-warning-700",
                    info: "!bg-primary-50 !text-primary-700",
                },
                className: "justify-center rounded-large !mb-safe"
            }}
            position="bottom-center"
        />
    )
}