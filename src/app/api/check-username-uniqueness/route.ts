import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/user";
import { usernameValidation } from "@/schemas/signUpSchema";
import { responseCookiesToRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

import {z} from "zod";



const UsernameQuerySchema = z.object({
    username: usernameValidation
})


export async function GET(request:Request){
    await dbConnect()
    try {
        console.log("Request URL:", request.url);
            const searchparams =  new URL(request.url)
            const queryParam = searchparams.searchParams.get('username')

            const result = UsernameQuerySchema.safeParse({ username: queryParam })
            console.log("result: "+ result)
            console.log("result.success: "+ result.success)
            console.log("result.data: "+ result.data)
            console.log("Extracted username:", queryParam);

            if(!result.success){
                const usernameErrors = result.error.format().username?._errors || []
                return Response.json({
                    success: false,
                    message :  usernameErrors?.length > 0 ? usernameErrors.join(', ') : 'Invalid query parameters'
                }, {status: 400})
            }
            const {username} = result.data

            const exisitingVerifiedUser = await UserModel.findOne({username})
            if(exisitingVerifiedUser){
                return Response.json({
                    success: false,
                    message :  'Username is already in use'
                }, {status: 202})
            }
            return Response.json({
                success: true,
                message :  'Username is avaliable!'
            }, {status: 200})

    } catch (error) {
        console.log("error checking username query" + error)
        return Response.json({
            success: false,
            message: "error checking username query"
        },
        {status: 500}
    )
    }
}
