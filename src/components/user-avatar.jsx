import React, { forwardRef } from 'react'
import { cn, AvatarProps, Avatar } from '@nextui-org/react'

/**
 * A user avatar component that displays a user's avatar image and name.
 * @type {React.ForwardRefExoticComponent<React.PropsWithoutRef<AvatarProps> & {user: Object; locale?: string;} & React.RefAttributes<HTMLElement>>}
 * @param {Object} props The properties of the component.
 * @param {Object} props.user The user object.
 * @param {string} props.user.full_name The user's name.
 * @param {string} props.user.username The user's username.
 * @param {string} props.user.avatar_url The URL of the user's avatar image.
 * @param {string} props.locale The locale of the user.
 * @returns {JSX.Element} The user avatar component.
 */
const UserAvatar = forwardRef(({ user, ...props }, ref) => {
    return (
        <Avatar
            {...props}
            ref={ref}
            name={user?.full_name}
            src={user?.avatar_url || ""}
        />
    )
})

export default UserAvatar