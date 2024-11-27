import { Card, CardBody, cn } from "@nextui-org/react"
import { Auth } from "@daveyplate/supabase-auth-nextui"
import { createClient } from "@/utils/supabase/component"
import { getURL } from "@/utils/utils"
import { useSessionContext } from "@supabase/auth-helpers-react"

export default function LoginPage() {
    const supabase = createClient()
    const { session, isLoading: sessionLoading } = useSessionContext()

    return (
        <div className={cn((session || sessionLoading) && "opacity-0",
            "flex flex-col grow items-center justify-center p-4 gap-4 transition-all"
        )}>
            <Card fullWidth className="max-w-sm p-2">
                <CardBody>
                    <Auth
                        supabaseClient={supabase}
                        socialLayout="horizontal"
                        providers={["github", "google", "facebook", "apple"]}
                        baseUrl={getURL()}
                    />
                </CardBody>
            </Card>

            <p className="text-center text-small text-default-400">
                By continuing, you agree to our&nbsp;

                <a href="/terms" className="underline">
                    Terms
                </a>

                &nbsp;&&nbsp;

                <a href="/privacy" className="underline">
                    Privacy
                </a>
            </p>
        </div>
    )
}
