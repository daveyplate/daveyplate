import { useSupabaseInfiniteSWR } from "@/utils/supabase/supabase-swr"
import { Button, Card, CardBody, Form, Input, User } from "@nextui-org/react"
import { useSession } from "@supabase/auth-helpers-react"
import { Profile, useProfiles } from "entities.generated"
import { useEffect, useState } from "react"

export default function Test() {
    const session = useSession()
    const { data: profile } = useSupabaseInfiniteSWR<Profile>(session ? "profiles" : null, { id: session?.user?.id })
    const { data: profiles, update, mutate } = useProfiles()
    const [fullName, setFullName] = useState<string>(profile?.[0]?.full_name || "")

    useEffect(() => {
        setFullName(profile?.[0]?.full_name || "")
    }, [profile])

    return (
        <div className="flex flex-col grow items-center justify center p-4 gap-4">
            <p>My Profile</p>

            <Button onPress={() => mutate()}>
                Mutate
            </Button>

            {profile?.[0] && (
                <>
                    <Card fullWidth className="max-w-sm p-2">
                        <CardBody className="items-start">
                            <User
                                avatarProps={{
                                    src: profile[0].avatar_url || undefined,
                                }}
                                name={profile[0].full_name}
                            />
                        </CardBody>
                    </Card>

                    <p>Update Profile</p>

                    <Form className="w-full max-w-sm gap-3" onSubmit={async (e) => {
                        e.preventDefault()
                        update(profile[0].id, { full_name: fullName })
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

            <p>Profiles</p>

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