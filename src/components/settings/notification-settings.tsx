import { useSession } from '@supabase/auth-helpers-react'

import { useEntity } from '@daveyplate/supabase-swr-entities/client'
import { AutoTranslate } from 'next-auto-translate'

import { CardBody, CardHeader, Switch } from "@nextui-org/react"
import CellWrapper from './cell-wrapper'
import { Metadata } from 'entity.types'

export default function NotificationSettings() {
    const session = useSession()
    const { entity: metadata, updateEntity: updateMetadata } = useEntity<Metadata>(session ? 'metadata' : null, 'me', null, { revalidateOnFocus: false })

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
                <CellWrapper>
                    <p>
                        <AutoTranslate tKey="pause_all">
                            Pause all
                        </AutoTranslate>
                    </p>

                    <Switch
                        isSelected={!metadata?.notifications_enabled}
                        onValueChange={(value) => updateMetadata({ notifications_enabled: !value })}
                        isDisabled={!metadata}
                    />
                </CellWrapper>

                <CellWrapper>
                    <p>
                        <AutoTranslate tKey="show_badge">
                            Show Badge
                        </AutoTranslate>
                    </p>

                    <Switch
                        isSelected={!!metadata?.notifications_badge_enabled}
                        onValueChange={(value) => updateMetadata({ notifications_badge_enabled: value })}
                        isDisabled={!metadata}
                    />
                </CellWrapper>

                <CellWrapper>
                    <p>
                        <AutoTranslate tKey="badge_count">
                            Badge Count
                        </AutoTranslate>
                    </p>

                    <Switch
                        onValueChange={(value) => updateMetadata({ show_badge_count: value })}
                        isDisabled={!metadata}
                    />
                </CellWrapper>
            </CardBody>

            <CardHeader className="px-4 pb-0">
                <p className="text-large">
                    <AutoTranslate tKey="notification_methods">
                        Notification Methods
                    </AutoTranslate>
                </p>
            </CardHeader>

            <CardBody className="gap-3">
                <CellWrapper>
                    <p>
                        <AutoTranslate tKey="push">
                            Push
                        </AutoTranslate>
                    </p>

                    <Switch
                        onValueChange={(value) => updateMetadata({ notifications_push: value })}
                        isDisabled={!metadata}
                    />
                </CellWrapper>

                <CellWrapper>
                    <p>
                        <AutoTranslate tKey="email">
                            Email
                        </AutoTranslate>
                    </p>

                    <Switch
                        onValueChange={(value) => updateMetadata({ notifications_email: value })}
                        isDisabled={!metadata}
                    />
                </CellWrapper>

                <CellWrapper>
                    <p>
                        <AutoTranslate tKey="sms">
                            SMS
                        </AutoTranslate>
                    </p>

                    <Switch
                        onValueChange={(value) => updateMetadata({ notifications_sms: value })}
                        isDisabled={!metadata}
                    />
                </CellWrapper>
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
                    <CellWrapper key={`notifications_${table}`}>
                        <p>
                            <AutoTranslate tKey={`notifications_${table}`}>
                                {label}
                            </AutoTranslate>
                        </p>

                        <Switch
                            isSelected={!!(metadata as any)?.[`notifications_${table}`]}
                            onValueChange={(value) => updateMetadata({ [`notifications_${table}`]: value })}
                            isDisabled={!metadata}
                        />
                    </CellWrapper>
                ))}
            </CardBody>
        </>
    )
}