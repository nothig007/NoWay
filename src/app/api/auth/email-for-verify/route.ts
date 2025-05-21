import { OTPModel, UserModel } from "@/model/user";
import dbConnect from "@/lib/dbConnect";
export async function POST(request: Request) {
    await dbConnect()
    try {
        const {AuthId} = await request.json()
        console.log("AuthId in emailforverify:"+ AuthId)
        const otpModel = await OTPModel.findOne({AuthId})
        if(!otpModel){
            return Response.json({
                success: false,
                message: "User not found- Invalid access"
            },
        {
            status: 401
        })
        }
        const otpCreatedAt = otpModel.createdAt
        const minCoolDowninSecs = 90
        const now = new Date()
        const timeDiff = Math.abs(now.getTime()- otpCreatedAt.getTime() )/1000
        console.log("time diff: "+ timeDiff)
        const emailId = otpModel.email
        const maskEmail = (emailId: string) => { if (!emailId.includes("@")) return emailId; const [local, domain] = emailId.split("@"); return local.slice(0, 3) + "*".repeat(local.length - 3) + "@" + domain; };
        
        if(timeDiff<minCoolDowninSecs){

            return Response.json({
                emailId: maskEmail(emailId),
                success: false,
                message: `Please wait for ${timeDiff}secs`,
                timeLeft: minCoolDowninSecs-timeDiff 
            },
            {
                status: 202
            }
        )
        }
        return Response.json({
            timeLeft: 0,
            emailId: maskEmail(emailId),
            success: true,
            message: "Email sent successfully"
        },
    {
        status: 200
    })
    } catch (error) {
        
    }
}