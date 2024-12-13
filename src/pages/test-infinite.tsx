import { useSupabaseInfiniteSWR } from "@/utils/supabase/supabase-swr"
import { useSession } from "@supabase/auth-helpers-react"
import { Message } from "entities.generated"
import { useEffect } from "react"

export default function Test() {
    const session = useSession()
    const { data: messages, size, setSize } = useSupabaseInfiniteSWR<Message>("messages",
        { limit: 20 }
    )

    useEffect(() => {
        // add a scroll listener
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
                setSize(size + 1)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [size])

    useEffect(() => {
        console.log(messages)
    }, [messages])

    return (
        <div className="flex flex-col grow items-center justify center p-4 gap-4">
            <div className="w-full max-w-xl flex flex-col gap-4">

            </div>
        </div>
    )
}