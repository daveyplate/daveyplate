import { AvatarProps } from '@nextui-org/react'
import { Avatar } from "@daveyplate/nextui-fixed-avatar"

/**
 * A user avatar component that displays a user's avatar image and name.
 * 
 * @typedef {object} UserAvatarProps The properties of the component.
 * @property {object} [user] The user object.
 * @property {string} [user.full_name] The user's name.
 * @property {string} [user.username] The user's username.
 * @property {string} [user.avatar_url] The URL of the user's avatar image.
 * 
 * @param {UserAvatarProps & AvatarProps} props The component properties.
 * @returns {JSX.Element} The user avatar component.
 */
const UserAvatar = ({ user, ...props }) => {
    return (
        <Avatar
            name={user?.full_name}
            src={user?.avatar_url || ""}
            {...props}
        />
    )
}

export default UserAvatar