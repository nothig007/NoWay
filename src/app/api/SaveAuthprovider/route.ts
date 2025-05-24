import dbConnect from "@/lib/dbConnect";
import { UserModel, TempEmailModel } from "@/model/user";

export async function POST(request:Request) {

    await dbConnect()
   try {
     console.log("request of saving auth prov: "+ request )
         const {username, email, provider} = await request.json()
         console.log("username: "+ username + " email: "+ email + " provider: "+ provider)
         const user = await TempEmailModel.findOne({
            email: email,
            provider: provider
         })
         const userId = user?.userId
         if(!user){
            return Response.json({
                message: "temp email expired",
                success: false
            },
        {
            status: 404
        })
         }
         const isUser = await UserModel.findOne({username: username}) 
         console.log(isUser)
         if(!isUser){
             const newUser = new UserModel({
                         userId: userId,
                         username: username,
                         email: email,
                         provider: provider
                     })
             await newUser.save()
             return Response.json({
                message: "User saved successfully",
                success: true
             },
            {
                status: 201
            }
            )

         }

         else{
            return Response.json({
                message: "User already exists",
                success: false

            },
        {
            status: 400
        })
         }
   } catch (error) {
    console.log("error while saving UserModel of auth provider")
    return Response.json({
        message: "Error while saving user",
        success: false
    },
{
    status: 401 
})
   }
}