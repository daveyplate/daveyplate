import { useTheme } from "next-themes"

import { Toaster } from "sonner"
import { Spinner } from "@nextui-org/react"
import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon
} from "@heroicons/react/24/solid"

export default function ToastProvider() {
    const { theme } = useTheme()

    return (
        <Toaster
            theme={theme}
            visibleToasts={1}
            richColors={true}
            icons={{
                success: <CheckCircleIcon className="size-5" />,
                info: <InformationCircleIcon className="size-5" />,
                warning: <ExclamationTriangleIcon className="size-5" />,
                error: <ExclamationCircleIcon className="size-5" />,
                loading: <Spinner size="sm" color="current" className="me-1 mt-1" />,
            }}
            toastOptions={{
                classNames: {
                    error: "!bg-danger-50",
                    success: "!bg-success-50",
                    warning: "!bg-warning-50",
                    info: "!bg-primary-50",
                },
                className: "!text-base justify-center rounded-full !gap-2.5"
            }}
            position="bottom-center"
        />
    )
}