import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/user";
import { usernameValidation } from "@/schemas/signUpSchema";
import { responseCookiesToRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

import {z} from "zod";



const UsernameQuerySchema = z.object({
    username: usernameValidation
})
const EmailQuerySchema = z.object({
    email: z.string().email({message: 'Invalid email address'})
})


export async function GET(request:Request){
    await dbConnect()
    try {
        console.log("Request URL:", request.url);
            const searchparams =  new URL(request.url)
            const queryParam = searchparams.searchParams.get('email')

            const result = EmailQuerySchema.safeParse({ email: queryParam })
            console.log("result: "+ result)
            console.log("result.success: "+ result.success)
            console.log("result.data: "+ result.data)
            console.log("Extracted email:", queryParam);

            if(!result.success){
                const emailErrors = result.error.format().email?._errors || []
                return Response.json({
                    success: false,
                    message :  emailErrors?.length > 0 ? emailErrors.join(', ') : 'Invalid query parameters'
                }, {status: 400})
            }
            const {email} = result.data

            const exisitingVerifiedUser = await UserModel.findOne({email})
            if(exisitingVerifiedUser){
                return Response.json({
                    success: false,
                    message :  'Email is already taken :('
                }, {status: 400})
            }
            return Response.json({
                success: true,
                message :  'Email is avaliable!'
            }, {status: 200})

    } catch (error) {
        console.log("error checking email query" + error)
        return Response.json({
            success: false,
            message: "error checking email query"
        },
        {status: 500}
    )
    }
}
