import {resend} from "@/lib/resend"

import VerificationEmail from "../../emails/VerificationEmail"

import { ApiResponse } from "@/types/ApiReponse"

export async function sendVerificationEmail(email:string,
    username: string,
    verifyCode: number
):Promise<ApiResponse> {

    try{
        await resend.emails.send({
            from: 'onboarding@resend.dev',
        to: 'shubh2k23@gmail.com',
        subject: 'Hello World',
        react: VerificationEmail({username, otp: verifyCode})
          });
        return{success: true, message:"successfully sent the verification email"}
    } catch(emailError){
        console.error("Error sending VerificationEmail: "+ emailError)
        return {success: false, message:"failed to send VerificationEmail"}
    }
    
}