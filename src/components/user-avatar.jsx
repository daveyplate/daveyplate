import React, { forwardRef } from 'react'
import { cn } from '@nextui-org/react'
import { Avatar } from '@daveyplate/nextui-fixed-avatar'

/**
 * A user avatar component that displays a user's avatar image and name.
 * @type {React.ForwardRefExoticComponent<React.PropsWithoutRef<import("@nextui-org/react").AvatarProps> & {user: Object; locale?: string;} & React.RefAttributes<HTMLElement>>}
 * @param {Object} props The properties of the component.
 * @param {Object} props.user The user object.
 * @param {string} props.user.name The user's name.
 * @param {string} props.user.username The user's username.
 * @param {string} props.user.avatar_url The URL of the user's avatar image.
 * @param {string} props.locale The locale of the user.
 * @returns {JSX.Element} The user avatar component.
 */
const UserAvatar = forwardRef(({ user, ...props }, ref) => {
    let textSize
    switch (props.size) {
        case 'sm':
            textSize = 'text-tiny'
            break
        case 'lg':
            textSize = 'text-xl'
            break
        default:
            textSize = 'text-sm'
    }

    return (
        <Avatar
            {...props}
            className={cn(textSize, props.className)}
            ref={ref}
            name={user?.full_name?.substring(0, 2)?.toUpperCase()}
            src={user?.avatar_url}
            alt={user?.full_name || "Avatar"}
        />
    )
})

export default UserAvatar