import { useSession } from '@supabase/auth-helpers-react'

import { AutoTranslate } from 'next-auto-translate'
import { useEntity } from '@daveyplate/supabase-swr-entities/client'

import { Switch, CardBody, CardHeader, table } from "@nextui-org/react"

export default function NotificationSettings() {
    const session = useSession()
    const { entity: metadata, updateEntity: updateMetadata } = useEntity(session ? 'metadata' : null, 'me', null, { revalidateOnFocus: false })

    const notificationTypes = [
        { table: 'whispers', label: 'Whispers' },
        { table: 'article_comments', label: 'Article Comments' }
    ]

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
                {notificationTypes.map(({ table, label }) => (
                    <Switch
                        key={`notifications_${table}`}
                        isSelected={!!metadata?.[`notifications_${table}`]}
                        onValueChange={(value) => updateMetadata({ [`notifications_${table}`]: value })}
                        classNames={{
                            base: "flex-row-reverse justify-between w-full max-w-full"
                        }}
                        className="bg-content2 p-4 rounded-medium"
                        isDisabled={!metadata}
                    >
                        <AutoTranslate tKey={`notifications_${table}`}>
                            {label}
                        </AutoTranslate>
                    </Switch>
                ))}
            </CardBody>
        </>
    )
}