import { Key } from 'react'
import { GetStaticPropsContext } from 'next'
import { useSessionContext } from '@supabase/auth-helpers-react'
import { useQueryState } from 'nuqs'

import { AutoTranslate } from 'next-auto-translate'

import { BellIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { Card, cn, Tab, Tabs } from "@nextui-org/react"

import { getLocalePaths } from "@/i18n/locale-paths"
import { getTranslationProps } from '@/i18n/translation-props'
import { isExport } from "@/utils/utils"

import AccountSettings from '@/components/settings/account-settings'
import ApplicationSettings from '@/components/settings/application-settings'
import ManageAccount from '@/components/settings/manage-account'
import NotificationSettings from '@/components/settings/notification-settings'

export default function Settings() {
    const { session, isLoading: sessionLoading } = useSessionContext()
    const [activeTab, setActiveTab] = useQueryState('tab', { defaultValue: "settings" })

    return (
        <div
            className={cn(sessionLoading && "opacity-0",
                "flex flex-col p-4 items-center"
            )}
        >
            <Card fullWidth className="max-w-xl px-1 pt-2">
                <Tabs
                    className="p-3"
                    classNames={{ tabContent: "text-small", base: cn(!session && "hidden") }}
                    size="lg"
                    selectedKey={activeTab}
                    onSelectionChange={(key: Key) => setActiveTab(key as string)}
                >
                    <Tab
                        key="settings"
                        textValue="Settings"
                        title={
                            <div className="flex items-center gap-1.5">
                                <Cog6ToothIcon className="size-5" />

                                <p>
                                    <AutoTranslate tKey="settings">
                                        Settings
                                    </AutoTranslate>
                                </p>
                            </div>
                        }
                    >
                        <ApplicationSettings />

                        {session && (
                            <>
                                <AccountSettings />
                                <ManageAccount />
                            </>
                        )}
                    </Tab>

                    <Tab
                        key="notifications"
                        className={cn(!session && "hidden")}
                        textValue="Notifications"
                        title={
                            <div className="flex items-center gap-1.5">
                                <BellIcon className="size-5" />

                                <p>
                                    <AutoTranslate tKey="notifications">
                                        Notifications
                                    </AutoTranslate>
                                </p>
                            </div>
                        }
                    >
                        <NotificationSettings />
                    </Tab>
                </Tabs>
            </Card>
        </div>
    )
}

export async function getStaticProps({ locale, params }: GetStaticPropsContext) {
    const translationProps = await getTranslationProps({ locale, params })

    return { props: { ...translationProps } }
}

export const getStaticPaths = isExport() ? getLocalePaths : undefined