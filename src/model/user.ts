import mongoose, {Schema, Document} from "mongoose";
import { string } from "zod";



export interface Message extends Document {
    content: String;
    createdAt : Date;
}


const MessageSchema: Schema<Message>= new Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now}
    })

    export interface tempEmail extends Document {
        email: string;
        userId: string;
        provider: string;
        createdAt: Date
    }
    
    export interface User extends Document{
        username: string
        email: string
        provider: string
        password: string
    }
    export interface OTP extends Document{
        username: string
        email: string
        password: string
        verifyCodeExpiry: Date
        verifyCode: string
        createdAt : Date;
        AuthId: string
}


const tempEmail: Schema<tempEmail> = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    provider: String,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60*60*12
    }
})

const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, "username is required"],
        match: [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/, "Please fill a valid email address"]
    },
    provider: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        required: function(){
            return this.provider === "";
        }, 
    }
})

const OTPSchema: Schema<OTP> =  new Schema({

    username: {
        type: String,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, "username is required"],
        unique: true,
        match: [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/, "Please fill a valid email address"]
    },
    password: {
        type: String,
        required: [true, "password is required"], 
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900 
    },
    verifyCodeExpiry: {
        type: Date,
        default: () => Date.now() + 15 * 60 * 1000
    },
    verifyCode: {
        type: String,
        required: [true, "Verify code is required"], 
    },
    AuthId: {
        type: String,
        required: [true, "AuthId is required"], 
    }
    
}
)

export const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema)
export const OTPModel = (mongoose.models.OTP as mongoose.Model<OTP>) || mongoose.model<OTP>("OTP", OTPSchema);
export const TempEmailModel = (mongoose.models.tempEmail as mongoose.Model<tempEmail>) || mongoose.model<tempEmail>("tempEmail", tempEmail);
// console.log(mongoose.models); // See if 'User' exists