import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import { OTPModel } from "@/model/user";
import bcrypt from "bcryptjs";

export async function POST(request: Request){
   try {
    await dbConnect
     const {AuthId} = await request.json()
     const otp = await OTPModel.findOne({AuthId: AuthId})
     if(!otp){
        return Response.json({
            status: false,
            message: "Please Re-Create your account"
        },
    {
        status: 401
    })
     }
    const otpCreatedAt = otp.createdAt
    const minCoolDowninSecs = 90
    const now = new Date()
    const timeDiff = Math.abs(now.getTime()- otpCreatedAt.getTime() )/1000
    console.log("otpCreatedAt: "+otpCreatedAt)
    console.log("time diff: "+(90-timeDiff))
     if(timeDiff<minCoolDowninSecs){
        return Response.json({
            success: false,
            message: `Please wait for ${timeDiff}secs`,
            timeLeft: 90-timeDiff 
        },
        {
            status: 202
        }
    )
    }
    const email = otp.email
    const username = otp.username
    const verifyCode = Math.floor(100000 + Math.random() * 900000);
    const hashedverifyCode = await bcrypt.hash((verifyCode.toString()), 10)
    otp.createdAt = now
    otp.verifyCodeExpiry = new Date(now.getTime() + 15 * 60 * 1000)
    otp.verifyCode = hashedverifyCode
    await otp.save()
    const emailResponse = await sendVerificationEmail(
                    email,
                    username,
                    verifyCode
                )
                if (!emailResponse.success){
                    return Response.json({
                    success: false,
                    message: emailResponse.message       
                    },
                    {
                        status: 500
                    }
                )
            }
                return Response.json({
                    AuthId: AuthId,
                    success: true,
                    message: "OTP sent successfully. PLease verify your email"
                },
                {
                    status: 201
                }
            )
    
   } catch (error) {
    console.log("error while resending otp");
        return Response.json({
            success: false,
            "message": "Invalid Request"
        },
    {
        status: 400
    })
   }
}