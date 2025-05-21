import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/user";

export async function POST(request:Request) {

    await dbConnect()

    try {
        console.log("request of checking identifer: "+ request )
        const {identifer} = await request.json()
        const User = await UserModel.findOne({ $or: [
            { email: identifer },
            { username: identifer }
        ]})
        if (User) {
            return Response.json({
                success: true,
                message: "User is in db"
            },
        {
            status: 201
        })
        }
        else{
            return Response.json({
                success: false,
                message: "Username/Email is incorrect"
            },
        {
            status: 404
        })
        }
    } catch (error) {
        console.error("Error while checking identifer"+error)
        return Response.json({
            success: false,
            message: `Error while checking identifier`,
        },
    {
        status: 400
    })
    }
}