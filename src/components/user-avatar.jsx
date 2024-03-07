import React, { forwardRef } from 'react'
import { Avatar, cn } from '@nextui-org/react'

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

UserAvatar.displayName = 'UserAvatar'

export default UserAvatar