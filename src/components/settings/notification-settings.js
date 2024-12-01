import { useEntity } from '@daveyplate/supabase-swr-entities/client'
import { AutoTranslate } from 'next-auto-translate'
import { Switch, CardBody, CardHeader } from "@nextui-org/react"
import { useSession } from '@supabase/auth-helpers-react'

export default function NotificationSettings() {
    const session = useSession()
    const { entity: metadata, updateEntity: updateMetadata } = useEntity(session ? 'metadata' : null, 'me', null, { revalidateOnFocus: false })

    return (
        <>
            <CardHeader className="px-4 py-0">
                <p className="text-large">
                    <AutoTranslate tKey="notification_settings">
                        Notification Settings
                    </AutoTranslate>
                </p>
            </CardHeader>

            <CardBody className="gap-3">
                <Switch
                    isSelected={!metadata?.notifications_enabled}
                    onValueChange={(value) => updateMetadata({ notifications_enabled: !value })}
                    classNames={{
                        base: "flex-row-reverse justify-between w-full max-w-full"
                    }}
                    className="bg-content2 p-4 rounded-medium"
                    isDisabled={!metadata}
                >
                    <AutoTranslate tKey="pause_all">
                        Pause all
                    </AutoTranslate>
                </Switch>

                <Switch
                    isSelected={!!metadata?.notifications_badge_enabled}
                    onValueChange={(value) => updateMetadata({ notifications_badge_enabled: value })}
                    classNames={{
                        base: "flex-row-reverse justify-between w-full max-w-full"
                    }}
                    className="bg-content2 p-4 rounded-medium"
                    isDisabled={!metadata}
                >
                    <AutoTranslate tKey="show_badge">
                        Show Badge
                    </AutoTranslate>
                </Switch>

                <Switch
                    isSelected={!!metadata?.show_badge_count}
                    onValueChange={(value) => updateMetadata({ show_badge_count: value })}
                    classNames={{
                        base: "flex-row-reverse justify-between w-full max-w-full"
                    }}
                    className="bg-content2 p-4 rounded-medium"
                    isDisabled={!metadata}
                >
                    <AutoTranslate tKey="badge_count">
                        Badge Count
                    </AutoTranslate>
                </Switch>

            </CardBody>

            <CardHeader className="px-4 pb-0">
                <p className="text-large">
                    <AutoTranslate tKey="notification_types">
                        Notification Types
                    </AutoTranslate>
                </p>
            </CardHeader>

            <CardBody className="gap-3">
                <Switch
                    isSelected={!!metadata?.notifications_whispers}
                    onValueChange={(value) => updateMetadata({ notifications_whispers: value })}
                    classNames={{
                        base: "flex-row-reverse justify-between w-full max-w-full"
                    }}
                    className="bg-content2 p-4 rounded-medium"
                    isDisabled={!metadata}
                >
                    <AutoTranslate tKey="whispers">
                        Whispers
                    </AutoTranslate>
                </Switch>

                <Switch
                    isSelected={!!metadata?.notifications_article_comments}
                    onValueChange={(value) => updateMetadata({ notifications_article_comments: value })}
                    classNames={{
                        base: "flex-row-reverse justify-between w-full max-w-full"
                    }}
                    className="bg-content2 p-4 rounded-medium"
                    isDisabled={!metadata}
                >
                    <AutoTranslate tKey="article_comments">
                        Article Comments
                    </AutoTranslate>
                </Switch>
            </CardBody>
        </>
    )
}