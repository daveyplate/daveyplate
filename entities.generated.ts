import { QueryData, SupabaseClient } from "@supabase/supabase-js"
import { Database } from "database.types"
import { createClient } from "@/utils/supabase/component"
import { QueryFilters, useEntities, useEntity } from "@/utils/supabase/supabase-swr"

const supabaseClient: SupabaseClient<Database> = createClient()

export const createQueries = () => {
    return {
        "article_comments": supabaseClient.from("article_comments").select(),
        "articles": supabaseClient.from("articles").select("*,user:user_id!inner(*)"),
        "message_likes": supabaseClient.from("message_likes").select(),
        "messages": supabaseClient.from("messages").select("*,user:profiles!inner(*),likes:message_likes(user_id, user:profiles(id, full_name, avatar_url))"),
        "metadata": supabaseClient.from("metadata").select(),
        "notifications": supabaseClient.from("notifications").select(),
        "peers": supabaseClient.from("peers").select(),
        "profiles": supabaseClient.from("profiles").select(),
        "whispers": supabaseClient.from("whispers").select("*,user:profiles!whispers_user_id_fkey!inner(*),recipient:profiles!whispers_recipient_id_fkey!inner(*)"),
    }
}

export type ArticleComments = QueryData<ReturnType<typeof createQueries>["article_comments"]>
export type Articles = QueryData<ReturnType<typeof createQueries>["articles"]>
export type MessageLikes = QueryData<ReturnType<typeof createQueries>["message_likes"]>
export type Messages = QueryData<ReturnType<typeof createQueries>["messages"]>
export type Metadata = QueryData<ReturnType<typeof createQueries>["metadata"]>
export type Notifications = QueryData<ReturnType<typeof createQueries>["notifications"]>
export type Peers = QueryData<ReturnType<typeof createQueries>["peers"]>
export type Profiles = QueryData<ReturnType<typeof createQueries>["profiles"]>
export type Whispers = QueryData<ReturnType<typeof createQueries>["whispers"]>

export function useArticleComments(enabled: boolean | null = true, filters?: QueryFilters | null) {
    return useEntities<ArticleComments>(enabled ? "article_comments" : null, filters)
}

export function useArticleComment(id?: string | null, filters?: QueryFilters | null) {
    return useEntity<ArticleComments>((id || filters) ? "article_comments" : null, id, filters)
}

export function useArticles(enabled: boolean | null = true, filters?: QueryFilters | null) {
    return useEntities<Articles>(enabled ? "articles" : null, filters)
}

export function useArticle(id?: string | null, filters?: QueryFilters | null) {
    return useEntity<Articles>((id || filters) ? "articles" : null, id, filters)
}

export function useMessageLikes(enabled: boolean | null = true, filters?: QueryFilters | null) {
    return useEntities<MessageLikes>(enabled ? "message_likes" : null, filters)
}

export function useMessageLike(id?: string | null, filters?: QueryFilters | null) {
    return useEntity<MessageLikes>((id || filters) ? "message_likes" : null, id, filters)
}

export function useMessages(enabled: boolean | null = true, filters?: QueryFilters | null) {
    return useEntities<Messages>(enabled ? "messages" : null, filters)
}

export function useMessage(id?: string | null, filters?: QueryFilters | null) {
    return useEntity<Messages>((id || filters) ? "messages" : null, id, filters)
}

export function useMetadatas(enabled: boolean | null = true, filters?: QueryFilters | null) {
    return useEntities<Metadata>(enabled ? "metadata" : null, filters)
}

export function useMetadata(id?: string | null, filters?: QueryFilters | null) {
    return useEntity<Metadata>((id || filters) ? "metadata" : null, id, filters)
}

export function useNotifications(enabled: boolean | null = true, filters?: QueryFilters | null) {
    return useEntities<Notifications>(enabled ? "notifications" : null, filters)
}

export function useNotification(id?: string | null, filters?: QueryFilters | null) {
    return useEntity<Notifications>((id || filters) ? "notifications" : null, id, filters)
}

export function usePeers(enabled: boolean | null = true, filters?: QueryFilters | null) {
    return useEntities<Peers>(enabled ? "peers" : null, filters)
}

export function usePeer(id?: string | null, filters?: QueryFilters | null) {
    return useEntity<Peers>((id || filters) ? "peers" : null, id, filters)
}

export function useProfiles(enabled: boolean | null = true, filters?: QueryFilters | null) {
    return useEntities<Profiles>(enabled ? "profiles" : null, filters)
}

export function useProfile(id?: string | null, filters?: QueryFilters | null) {
    return useEntity<Profiles>((id || filters) ? "profiles" : null, id, filters)
}

export function useWhispers(enabled: boolean | null = true, filters?: QueryFilters | null) {
    return useEntities<Whispers>(enabled ? "whispers" : null, filters)
}

export function useWhisper(id?: string | null, filters?: QueryFilters | null) {
    return useEntity<Whispers>((id || filters) ? "whispers" : null, id, filters)
}
