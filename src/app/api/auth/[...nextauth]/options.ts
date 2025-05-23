import { Account, NextAuthOptions, Profile, User } from 'next-auth';
import CredentialsProvider, { CredentialInput } from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import { OTPModel, TempEmailModel, UserModel } from '@/model/user';
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import {MongoDBAdapter} from "@next-auth/mongodb-adapter"
import clientPromise from '@/lib/db';
export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
     CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });
          if (!user) {
            throw new Error('No user found with this email');
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error('Incorrect password');
          }
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
    }
  }),
  GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    authorization: {
    params: {
      scope: "read:user user:email",
    },
  },
      
    }
  
  )

  ],
  
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        console.log("GitHub User Data:", JSON.stringify(user, null, 2))
        const email = await TempEmailModel.findById(user.id)
        token.provider = account.provider;
        token.email = email?.email || user.email || token.email || "Missing Email";
    console.log("✅ Setting email from user object during sign in:", token.email);
        token.image = user.image;   
        token._id = user._id?.toString(); // Convert ObjectId to string
        console.log("JWT Token:");

      }
      else{
        
        if (user) {
          console.log("GitHub User Data:", JSON.stringify(user, null, 2))
          token._id = user._id?.toString(); // Convert ObjectId to string
        token.username = user.username;
        token.email = user.email
      }
    }
    token.email = token.email ?? "Missing Email";
    console.log("JWT Token:", JSON.stringify(token, null, 2));
      return token;
    },
    async session({ session, token }) {
      console.log("session: "+session)
      console.log("session: "+session.user)
      console.log("session: "+session.user.username)
      if (token) {
        session.user._id = token._id;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.image = token.image;
      }
      return session;
    },
    async signIn({ user, account }) {
    if (!account) {
      console.error("Account is null, skipping GitHub email fetch.");
      return false; // ✅ Explicitly return false instead of undefined
    }
    
    if (account.provider === "github") {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `token ${account.access_token}`,

        },
      });
      const emails = await emailRes.json();
      console.log("emails"+ emails)
      const primaryEmail = Array.isArray(emails) ? emails.find((e) => e.primary)?.email : null;
      if (primaryEmail) {
      const tempEmail = new TempEmailModel({
        _id: user.id,
        email: primaryEmail
      })
      await tempEmail.save()
    }
      user.email = primaryEmail || user.email;
      console.log("user.email: "+ user.email)
    }
    console.log("GitHub :", JSON.stringify(user, null, 2))

    return true
  },
},
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/sign-in',
  },
};