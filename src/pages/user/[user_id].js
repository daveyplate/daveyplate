import { useRouter } from "next/router"

import { AutoTranslate } from 'next-auto-translate'

import { getTranslationProps } from "@/i18n/translation-props"
import { getLocalePaths } from "@/i18n/locale-paths"

import {
    Card,
    CardBody,
    cn
} from "@nextui-org/react"

import UserAvatar from "@/components/user-avatar"
import PageTitle from "@/components/page-title"
import { isExport } from "@/utils/utils"

import { useEntity } from "@daveyplate/supabase-swr-entities/client"

export default function UserPage() {
    const router = useRouter()
    const { entity: user } = useEntity('profiles', router.query.user_id)

    return (
        <div className="flex-center max-w-lg">
            <PageTitle title={user?.full_name || ""} />

            <Card fullWidth>
                <CardBody className="p-4 flex-row items-center gap-4">
                    <UserAvatar user={user} size="lg" />

                    <div>
                        <p className="font-semibold">
                            {user?.full_name || "Unnamed"}
                        </p>

                        <p className="text-foreground-400 text-small">
                            <AutoTranslate tKey="subscription">
                                Subscription:
                            </AutoTranslate>

                            <span className={cn('ml-1.5', user?.claims?.premium ? "text-success font-semibold" : "text-foreground font-light")}>
                                {user?.claims?.premium ?
                                    <AutoTranslate tKey="active">
                                        Active
                                    </AutoTranslate>
                                    :
                                    <AutoTranslate tKey="inactive">
                                        Inactive
                                    </AutoTranslate>
                                }
                            </span>
                        </p>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}

export async function getStaticPaths() {
    if (isExport()) return getLocalePaths()

    return {
        paths: [{ params: { user_id: "me" } }],
        fallback: "blocking"
    }
}

export async function getStaticProps({ locale, params }) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps, overrideTitle: true, canGoBack: true } }
}
