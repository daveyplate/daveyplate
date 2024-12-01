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
                    title: "!text-small",
                    error: "!bg-danger-50 !border-danger-100 !text-danger-700",
                    success: "!bg-success-50 !border-success-100 !text-success-700",
                    warning: "!bg-warning-50 !border-warning-100 !text-warning-700",
                    info: "!bg-primary-50 !border-primary-100 !text-primary-700"
                },
                className: "justify-center rounded-large !my-safe !gap-1.5"
            }}
            position="bottom-center"
        />
    )
}