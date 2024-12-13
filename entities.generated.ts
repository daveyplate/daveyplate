import { QueryData, SupabaseClient } from "@supabase/supabase-js"
import { SWRConfiguration } from "swr"

import { QueryFilters, useEntities, useEntity } from "@/utils/supabase/supabase-swr"

import { createClient } from "@/utils/supabase/component"
import { Database } from "database.types"
const supabaseClient: SupabaseClient<Database> = createClient()

export const createQueries = () => {
    return {
        "article_comments": supabaseClient.from("article_comments").select(),
        "articles": supabaseClient.from("articles").select("*,user:user_id!inner(*)"),
        "message_likes": supabaseClient.from("message_likes").select(),
        "messages": supabaseClient.from("messages").select("*,user:profiles!inner(*),likes:message_likes(id, user_id, user:profiles!inner(id, full_name, avatar_url))"),
        "metadata": supabaseClient.from("metadata").select(),
        "notifications": supabaseClient.from("notifications").select(),
        "peers": supabaseClient.from("peers").select(),
        "profiles": supabaseClient.from("profiles").select(),
        "whispers": supabaseClient.from("whispers").select("*,user:profiles!whispers_user_id_fkey!inner(*),recipient:profiles!whispers_recipient_id_fkey!inner(*)"),
    }
}

export type ArticleComment = QueryData<ReturnType<typeof createQueries>["article_comments"]>[0]
export type Article = QueryData<ReturnType<typeof createQueries>["articles"]>[0]
export type MessageLike = QueryData<ReturnType<typeof createQueries>["message_likes"]>[0]
export type Message = QueryData<ReturnType<typeof createQueries>["messages"]>[0]
export type Metadata = QueryData<ReturnType<typeof createQueries>["metadata"]>[0]
export type Notification = QueryData<ReturnType<typeof createQueries>["notifications"]>[0]
export type Peer = QueryData<ReturnType<typeof createQueries>["peers"]>[0]
export type Profile = QueryData<ReturnType<typeof createQueries>["profiles"]>[0]
export type Whisper = QueryData<ReturnType<typeof createQueries>["whispers"]>[0]

export function useArticleComments(enabled: boolean | null = true, filters?: QueryFilters<ArticleComment> | null, config?: SWRConfiguration | null) {
    const result = useEntities<ArticleComment>(enabled ? "article_comments" : null, filters, config)
    return { ...result, articleComments: result.data }
}

export function useArticleComment(id?: string | null, filters?: QueryFilters<ArticleComment> | null, config?: SWRConfiguration | null) {
    const result = useEntity<ArticleComment>((id || filters) ? "article_comments" : null, id, filters, config)
    return { ...result, articleComment: result.data }
}

export function useArticles(enabled: boolean | null = true, filters?: QueryFilters<Article> | null, config?: SWRConfiguration | null) {
    const result = useEntities<Article>(enabled ? "articles" : null, filters, config)
    return { ...result, articles: result.data }
}

export function useArticle(id?: string | null, filters?: QueryFilters<Article> | null, config?: SWRConfiguration | null) {
    const result = useEntity<Article>((id || filters) ? "articles" : null, id, filters, config)
    return { ...result, article: result.data }
}

export function useMessageLikes(enabled: boolean | null = true, filters?: QueryFilters<MessageLike> | null, config?: SWRConfiguration | null) {
    const result = useEntities<MessageLike>(enabled ? "message_likes" : null, filters, config)
    return { ...result, messageLikes: result.data }
}

export function useMessageLike(id?: string | null, filters?: QueryFilters<MessageLike> | null, config?: SWRConfiguration | null) {
    const result = useEntity<MessageLike>((id || filters) ? "message_likes" : null, id, filters, config)
    return { ...result, messageLike: result.data }
}

export function useMessages(enabled: boolean | null = true, filters?: QueryFilters<Message> | null, config?: SWRConfiguration | null) {
    const result = useEntities<Message>(enabled ? "messages" : null, filters, config)
    return { ...result, messages: result.data }
}

export function useMessage(id?: string | null, filters?: QueryFilters<Message> | null, config?: SWRConfiguration | null) {
    const result = useEntity<Message>((id || filters) ? "messages" : null, id, filters, config)
    return { ...result, message: result.data }
}

export function useMetadatas(enabled: boolean | null = true, filters?: QueryFilters<Metadata> | null, config?: SWRConfiguration | null) {
    const result = useEntities<Metadata>(enabled ? "metadata" : null, filters, config)
    return { ...result, metadatas: result.data }
}

export function useMetadata(id?: string | null, filters?: QueryFilters<Metadata> | null, config?: SWRConfiguration | null) {
    const result = useEntity<Metadata>((id || filters) ? "metadata" : null, id, filters, config)
    return { ...result, metadata: result.data }
}

export function useNotifications(enabled: boolean | null = true, filters?: QueryFilters<Notification> | null, config?: SWRConfiguration | null) {
    const result = useEntities<Notification>(enabled ? "notifications" : null, filters, config)
    return { ...result, notifications: result.data }
}

export function useNotification(id?: string | null, filters?: QueryFilters<Notification> | null, config?: SWRConfiguration | null) {
    const result = useEntity<Notification>((id || filters) ? "notifications" : null, id, filters, config)
    return { ...result, notification: result.data }
}

export function usePeers(enabled: boolean | null = true, filters?: QueryFilters<Peer> | null, config?: SWRConfiguration | null) {
    const result = useEntities<Peer>(enabled ? "peers" : null, filters, config)
    return { ...result, peers: result.data }
}

export function usePeer(id?: string | null, filters?: QueryFilters<Peer> | null, config?: SWRConfiguration | null) {
    const result = useEntity<Peer>((id || filters) ? "peers" : null, id, filters, config)
    return { ...result, peer: result.data }
}

export function useProfiles(enabled: boolean | null = true, filters?: QueryFilters<Profile> | null, config?: SWRConfiguration | null) {
    const result = useEntities<Profile>(enabled ? "profiles" : null, filters, config)
    return { ...result, profiles: result.data }
}

export function useProfile(id?: string | null, filters?: QueryFilters<Profile> | null, config?: SWRConfiguration | null) {
    const result = useEntity<Profile>((id || filters) ? "profiles" : null, id, filters, config)
    return { ...result, profile: result.data }
}

export function useWhispers(enabled: boolean | null = true, filters?: QueryFilters<Whisper> | null, config?: SWRConfiguration | null) {
    const result = useEntities<Whisper>(enabled ? "whispers" : null, filters, config)
    return { ...result, whispers: result.data }
}

export function useWhisper(id?: string | null, filters?: QueryFilters<Whisper> | null, config?: SWRConfiguration | null) {
    const result = useEntity<Whisper>((id || filters) ? "whispers" : null, id, filters, config)
    return { ...result, whisper: result.data }
}
