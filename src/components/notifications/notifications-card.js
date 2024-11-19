import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Tabs,
    Tab,
    ScrollShadow,
    CardFooter,
} from "@nextui-org/react"

import NotificationItem from "./notification-item"
import { BellSlashIcon, Cog6ToothIcon, TrashIcon } from "@heroicons/react/24/solid"
import { useState } from "react"
import { Link } from "@/i18n/routing"
import SwipeToDelete from "react-swipe-to-delete-ios"

export default function NotificationsCard({ notifications, setIsOpen, ...props }) {
    const [activeTab, setActiveTab] = useState("all")
    let activeNotifications = notifications?.filter((notification) => {
        return activeTab == "all" || !notification.is_read
    })

    const unreadNotifications = notifications?.filter((notification) => !notification.is_read)

    return (
        <Card fullWidth {...props}>
            <CardHeader className="flex flex-col px-0 pt-2 pb-0">
                <div className="flex w-full items-center justify-between px-6 py-2">
                    <div className="flex items-center gap-2">
                        <h4>
                            Notifications
                        </h4>

                        <Chip size="sm" variant="flat">
                            {notifications?.length}
                        </Chip>
                    </div>

                    <Button color="primary" radius="full" variant="light" className="-me-2">
                        Mark all as read
                    </Button>
                </div>

                <Tabs
                    aria-label="Notifications"
                    classNames={{
                        base: "w-full",
                        tabList: "gap-6 px-6 py-0 w-full relative rounded-none border-b border-default",
                        cursor: "w-full",
                        tab: "max-w-fit px-2 h-12",
                    }}
                    color="primary"
                    selectedKey={activeTab}
                    variant="underlined"
                    onSelectionChange={(selected) => setActiveTab(selected)}
                    size="lg"
                >
                    <Tab
                        key="all"
                        title={
                            <div className="flex items-center gap-2">
                                <span>
                                    All
                                </span>

                                <Chip size="sm" variant="flat">
                                    {notifications?.length}
                                </Chip>
                            </div>
                        }
                    />

                    <Tab
                        key="unread"
                        title={
                            <div className="flex items-center space-x-2">
                                <span>
                                    Unread
                                </span>

                                <Chip size="sm" variant="flat">
                                    {unreadNotifications?.length}
                                </Chip>
                            </div>
                        }
                    />
                </Tabs>
            </CardHeader>
            <CardBody className="w-full gap-0 p-0">
                <ScrollShadow className="h-[420px]">
                    {activeNotifications?.length ? (
                        activeNotifications.map((notification) => (
                            <NotificationItem key={notification.id} notification={notification} setIsOpen={setIsOpen} />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center grow gap-2">
                            <BellSlashIcon className="text-default-400 size-16" />

                            <p className="text-base text-default-400">
                                No notifications yet.
                            </p>
                        </div>
                    )}
                </ScrollShadow>
            </CardBody>

            <CardFooter className="justify-end gap-4 p-4">
                <Button
                    as={Link}
                    size="lg"
                    href="/settings"
                    onPress={() => setIsOpen(false)}
                    startContent={
                        <Cog6ToothIcon className="size-5 -ms-1" />
                    }
                >
                    Settings
                </Button>

                <Button
                    variant="flat"
                    size="lg"
                    startContent={
                        <TrashIcon className="size-5 -ms-1" />
                    }
                >
                    Clear All
                </Button>
            </CardFooter>
        </Card>
    );
}
