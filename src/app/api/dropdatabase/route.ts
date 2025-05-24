import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";

export async function POST(request:Request) {
    await dbConnect()
    try {
        const {key} = await request.json()
        if (key==="wtf12345"){
            await mongoose.connection.dropCollection('users');
            await mongoose.connection.dropCollection('accounts');
            await mongoose.connection.dropCollection('tempemails');
            return Response.json({
                message: "Collections dropped",
                success: true
            }, {status: 200})
        }
    } catch (error) {
        return Response.json({
            message: "Error",
            success: false
        },
    {status: 500})
    }
}