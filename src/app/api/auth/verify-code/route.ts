import dbConnect from "@/lib/dbConnect";

import { OTPModel, UserModel } from "@/model/user";
import { usernameValidation } from "@/schemas/signUpSchema";
import bcrypt from "bcryptjs";


export async function POST(request:Request) {
    await dbConnect()
    try {
        const {AuthId, code} = await request.json()
        console.log("AuthId: " + AuthId)
        const decodedAuthId = decodeURIComponent(AuthId)
        console.log("decodedAuthId: " + decodedAuthId)
        console.log("code: "+code)
        const newOtp = await OTPModel.findOne({AuthId: decodedAuthId })
        if(!newOtp) {
            return Response.json ({
                success: false,
                message: "Failed to find OTP through AuthId"
            },
        {status: 401})
        }
    const Otp = String(code)
    // const IsCodeValid = user.verifyCode === code.toString()
    const IsCodeValid = await bcrypt.compare(Otp,newOtp.verifyCode)
    console.log("newOtp.verifyCode:  "+ newOtp.verifyCode)
    console.log("IsCodeValid:  "+ IsCodeValid)
    console.log("date rn: "+ new Date())
    console.log("verifyCodeExpiry: "+ new Date(newOtp.verifyCodeExpiry))
    const IsCodeNotExpired = new Date(newOtp.verifyCodeExpiry) > new Date()
    if(IsCodeValid&& IsCodeNotExpired){
        const user = new UserModel({
            username: newOtp.username,
            email: newOtp.email,
            password: newOtp.password,
            isVerified : true,
        })
        await user.save()
        await OTPModel.deleteOne({AuthId: AuthId})
        return Response.json({
            success: true,
            message: "User verified successfully"
        },

        {status: 200}
    )
}

    else if (!IsCodeNotExpired){
        return Response.json({
            success: false,
            message: "Verification code has expired please sign up again"
        },

        {status: 400}
    )
    }
    else if (!IsCodeValid){
        return Response.json({
            success: false,
            message: "Incorrect verification code"
        },

        {status: 401}
    )
    }
    } catch (error) {
        console.log("error in verifying code: "+ error)
        return Response.json({
            success: false,
            message: "Error in verifying code"
        },
    {status: 500}
)
    }

}