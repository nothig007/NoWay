// import { getServerSession } from "next-auth";
// import { AuthOptions } from "next-auth";

// import dbConnect from "@/lib/dbConnect";

// import { UserModel } from "@/model/user";
// import { User } from "next-auth";
// import { authOptions } from "../auth/[...nextauth]/options";

// export async function POST(request: Request){
//     await dbConnect()
//     const session = await getServerSession(authOptions)
//     const user:User = session?.user as User
//     if(!session || !user) {
//         return Response.json({
//             success: false,
//             message: "user not authenticated"
//         },
//     {status : 401})
//     }
//     const userId = user._id
//     const {acceptingMessages} = await request.json()

//     try {
//         const updatedUser = await UserModel.findByIdAndUpdate(
//             userId,
//             {isAcceptingMessage:acceptingMessages},
//             {new: true}
//         )
//         if(!updatedUser){
//             return Response.json({
//                 success: false,
//                 message: "user not authenticated"
//             },
//         {status : 401})
//         }



//         return Response.json({
//             success: true,
//             message: "message acceptance status updated successfully"
//         },
//     {status : 201})
//     } catch (error) {
//         console.log("failed to update user status to accept messages")
//         return Response.json({
//             success: false,
//             message: "failed to update user status to accept messages"
//         },
//     {status : 500})
//     }
// }
// export async function GET(request: Request){
//     await dbConnect()
//     const session = await getServerSession(authOptions)
//     const user:User = session?.user as User
//     if(!session || !user) {
//         return Response.json({
//             success: false,
//             message: "user not authenticated"
//         },
//     {status : 401})
//     }
//     const userId = user._id
//     try {
//         const foundUser = await UserModel.findByIdAndUpdate(userId)
//         if(!foundUser){
//             return Response.json({
//                 success: false,
//                 message: "user not found"
//             },
//         {status : 404})
//         }
//         return Response.json({
//             success: true,
//             isAcceptingMessages: foundUser.isAcceptingMessage
//         },
    
//         {status : 200})
//     } catch (error) {
//         console.log("Failed to update user status to accept messages")
//         return Response.json({
//             success: false,
//             message: "Error in getting message acceptance status"
//         },
//     {status : 500})
//     }

// }