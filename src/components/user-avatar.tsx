import { Avatar } from "@daveyplate/nextui-fixed-avatar"
import { AvatarProps, ButtonProps } from '@nextui-org/react'

// TODO inherit "as" props?

interface UserAvatarProps {
    user?: {
        full_name?: string | null
        username?: string | null
        avatar_url?: string | null
    } | null
}

const UserAvatar = ({ user, ...props }: UserAvatarProps & AvatarProps & ButtonProps) => {
    return (
        <Avatar
            name={user?.full_name || ""}
            src={user?.avatar_url || ""}
            {...props}
        />
    )
}

export default UserAvatar