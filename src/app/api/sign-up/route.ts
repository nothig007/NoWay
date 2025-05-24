import dbConnect from "@/lib/dbConnect";

import { randomUUID } from "crypto";
import { UserModel, OTPModel } from "@/model/user";

import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { messageSchema } from "@/schemas/messageSchema";
import { useRouter } from "next/navigation";


export async function POST(request:Request) {

    await dbConnect()
    try {
        console.log(request)
        const {username, email, password} = await request.json()
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username: username
        })
        if(existingUserVerifiedByUsername){
            return Response.json({
                success: false,
                message:"username already exists! "
            },
            {
                status: 400
            }
            )
        }
        const existingUserByEmail = await UserModel.findOne({email})
        const verifyCode = Math.floor(100000 + Math.random() * 900000);
        const hashedverifyCode = await bcrypt.hash((verifyCode.toString()), 10)
        if(existingUserByEmail){
                return Response.json({
                    success: false,
                    message: "User already exists with this email"
                },
                {
                    status: 500
                }
            )
        
        
        // CODE FOR RE-VERIFICATION: 

        //re verification page
        //idk rn

        // const hashedPassword = await bcrypt.hash(password, 10) 
        // existingUserByEmail.password = hashedPassword
        // newOTPbyEmail.verifyCode = hashedverifyCode
            // newOTPbyEmail.verifyCodeExpiry = new Date(Date.now()+ 3600000)
            // await existingUserByEmail.save()
        }
        else{
            const userByOtp = await OTPModel.findOne({email: email})
            if(userByOtp){
                const AuthId = userByOtp.AuthId
                return Response.json({
                    AuthId: AuthId,
                    success: false,
                    message: "User already got OTP"
                },
            {
                status: 201
            })
        }
            else{

                
                const hashedPassword = await bcrypt.hash(password, 10)
                const expiryDate = new Date()
            expiryDate.setMinutes(expiryDate.getMinutes() + 15);
            const AuthId = randomUUID();
            
            const newOTP = new OTPModel({
                username: username,
                email: email,
                password: hashedPassword,
                verifyCode: hashedverifyCode,
                AuthId: AuthId,
            })
            await newOTP.save()

            // send verification email
            
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
                message: "User registered succesfully. PLease verify your email"
            },
            {
                status: 201
            }
        )
    }
}
} catch (error) {
    console.log("Error registering user: "+ error)
        return Response.json({
            success: false,
            message: "Error registering user"
        }, 
        {
            status:500
        }
    )
    }
    
}