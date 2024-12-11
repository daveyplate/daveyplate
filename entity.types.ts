import { Tables } from "database.types"

export interface Profile extends Tables<"profiles"> { }

export interface Article extends Tables<"articles"> {
    user: Profile
}

export interface ArticleComment extends Tables<"article_comments"> {
    user: Profile
    article: Article
}

export interface MessageLike extends Tables<"message_likes"> {
    user: Profile
    message: Message
}

export interface Notification extends Tables<"notifications"> {
    sender: Profile
}

export interface Message extends Tables<"messages"> {
    likes: MessageLike[]
    user: Profile
}

export interface Whisper extends Tables<"whispers"> {
    user: Profile
    recipient: Profile
    likes: MessageLike[]
}