import { Tables } from "database.types"

export interface Profile extends Tables<"profiles"> { }

export interface Article extends Tables<"articles"> {
    user: Profile
}

export interface Message extends Tables<"messages"> { }