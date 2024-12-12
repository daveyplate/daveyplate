import { useEntities } from "@/utils/supabase/supabase-swr"
import { Button, Card, CardBody, Form, Input, User } from "@nextui-org/react"
import { useSession } from "@supabase/auth-helpers-react"
import { Profiles, useProfile } from "entities.generated"
import { useEffect, useState } from "react"

export default function Test() {
    const session = useSession()
    const { data: profile } = useProfile(session?.user?.id)
    const { data: profiles, update, mutate } = useEntities<Profiles>("profiles")
    const [fullName, setFullName] = useState<string>(profile?.full_name || "")

    useEffect(() => {
        setFullName(profile?.full_name || "")
    }, [profile])

    return (
        <div className="flex flex-col grow items-center justify center p-4 gap-4">
            <p>My Profile</p>

            <Button onPress={() => mutate()}>
                Mutate
            </Button>

            {profile && (
                <>
                    <Card fullWidth className="max-w-sm p-2">
                        <CardBody className="items-start">
                            <User
                                avatarProps={{
                                    src: profile.avatar_url || undefined,
                                }}
                                name={profile.full_name}
                            />
                        </CardBody>
                    </Card>

                    <p>Update Profile</p>

                    <Form className="w-full max-w-sm gap-3" onSubmit={async (e) => {
                        e.preventDefault()
                        update(profile.id, { full_name: fullName })
                    }}>
                        <Input
                            fullWidth
                            label="Full Name"
                            placeholder="John Doe"
                            value={fullName}
                            onValueChange={setFullName}
                        />

                        <Button
                            type="submit"
                            color="primary"
                        >
                            Save
                        </Button>
                    </Form>
                </>
            )}

            <p>All Profiles</p>

            {profiles?.map(profile => (
                <Card key={profile.id} fullWidth className="max-w-sm p-2">
                    <CardBody className="items-start">
                        <User
                            avatarProps={{
                                src: profile.avatar_url || undefined,
                            }}
                            name={profile.full_name}
                        />
                    </CardBody>
                </Card>
            ))}
        </div>
    )
}