import { Message } from "@/model/user"

export interface ApiResponse{
    success: boolean
    message: string
    AuthId?: string
    messages?: Array<Message>
}