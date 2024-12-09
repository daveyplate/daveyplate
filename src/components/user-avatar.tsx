import { Avatar } from "@daveyplate/nextui-fixed-avatar"
import { AvatarProps } from '@nextui-org/react'

interface UserAvatarProps {
    user?: {
        full_name?: string
        username?: string
        avatar_url?: string
    }
}

const UserAvatar = ({ user, ...props }: UserAvatarProps & AvatarProps) => {
    return (
        <Avatar
            name={user?.full_name}
            src={user?.avatar_url || ""}
            {...props}
        />
    )
}

export default UserAvatar