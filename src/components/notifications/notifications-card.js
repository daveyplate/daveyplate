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
import { BellSlashIcon, TrashIcon } from "@heroicons/react/24/solid"
import { useState } from "react"
import { Link } from "@/i18n/routing"
import SwipeToDelete from "react-swipe-to-delete-ios"

export default function NotificationsCard({ notifications, setIsOpen, ...props }) {
    const [activeTab, setActiveTab] = useState("all")
    const activeNotifications = notifications?.filter((notification) => {
        return activeTab == "all" || !notification.is_read
    })

    const unreadNotifications = notifications?.filter((notification) => !notification.is_read)

    return (
        <Card fullWidth {...props}>
            <CardHeader className="flex flex-col px-0 pb-0">
                <div className="flex w-full items-center justify-between px-5 py-2">
                    <div className="inline-flex items-center gap-2">
                        <h4 className="inline-block align-middle font-medium">
                            Notifications
                        </h4>

                        <Chip size="sm" variant="flat">
                            {notifications?.length}
                        </Chip>
                    </div>

                    <Button color="primary" radius="full" variant="light">
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
                            <div className="flex items-center space-x-2">
                                <span>All</span>

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
                <ScrollShadow className="h-[420px] w-full flex flex-col">
                    {activeNotifications?.length ? (
                        activeNotifications.map((notification) => (
                            <SwipeToDelete
                                key={notification.id}
                                className="!w-full !bg-danger"
                                height="fit"
                                deleteColor="transparent"
                                deleteComponent={
                                    <TrashIcon className="size-5 mx-auto" />
                                }
                            >
                                <NotificationItem key={notification.id} notification={notification} setIsOpen={setIsOpen} />
                            </SwipeToDelete>
                        ))
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                            <BellSlashIcon className="text-default-400 size-16" />

                            <p className="text-base text-default-400">
                                No notifications yet.
                            </p>
                        </div>
                    )}
                </ScrollShadow>
            </CardBody>

            <CardFooter className="justify-end gap-2 px-4">
                <Button as={Link} size="lg" href="/settings" onPress={() => setIsOpen(false)}>
                    Settings
                </Button>

                <Button variant="flat" size="lg">
                    Clear All
                </Button>
            </CardFooter>
        </Card>
    );
}
